# DeepSeek-VL 部署指南

本文档详细说明如何部署 DeepSeek-VL 视觉-语言大模型，用于皮肤分析功能。

## 📋 目录

- [系统要求](#系统要求)
- [部署方案选择](#部署方案选择)
- [方案一：Docker 部署（推荐）](#方案一docker-部署推荐)
- [方案二：本地部署](#方案二本地部署)
- [方案三：云端部署](#方案三云端部署)
- [API 接口说明](#api-接口说明)
- [对接到小程序](#对接到小程序)

---

## 系统要求

### 硬件要求

| 部署方式 | 显卡 | 显存 | 内存 | 磁盘 |
|---------|------|------|------|------|
| Docker（量化版） | NVIDIA GPU | ≥12GB | ≥32GB | ≥50GB |
| 本地部署（全量） | NVIDIA GPU | ≥24GB | ≥64GB | ≥100GB |
| 本地部署（4-bit 量化） | NVIDIA GPU | ≥8GB | ≥16GB | ≥50GB |

### 软件要求

- Docker 20.10+
- NVIDIA Docker Runtime（GPU 支持）
- Python 3.10+
- CUDA 11.8+（本地部署）
- Git

---

## 部署方案选择

### 🎯 推荐方案：Docker + 4-bit 量化

**优点**：
- 部署简单，一键启动
- 资源占用低（8GB 显存即可运行）
- 环境隔离，不会影响宿主机
- 支持快速扩容和迁移

**适用场景**：
- 个人开发者
- 中小型团队
- 测试和开发环境

---

## 方案一：Docker 部署（推荐）

### 步骤 1：安装 Docker 和 NVIDIA Runtime

#### Ubuntu/Debian
```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 NVIDIA Container Toolkit
distribution=$(. /etc/os-release;echo $ID$VERSION_ID)
curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add -
curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | \
  sudo tee /etc/apt/sources.list.d/nvidia-docker.list

sudo apt-get update
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker
```

#### 验证安装
```bash
docker run --rm --gpus all nvidia/cuda:11.8.0-base-ubuntu20.04 nvidia-smi
```

### 步骤 2：下载 DeepSeek-VL 模型

DeepSeek-VL 有两个版本：

#### DeepSeek-VL-7B（轻量版，推荐）
```bash
# 创建模型目录
mkdir -p ~/deepseek-vl/models
cd ~/deepseek-vl/models

# 使用 huggingface-cli 下载
pip install huggingface_hub
huggingface-cli download deepseek-ai/deepseek-vl-7b-chat --local-dir ./deepseek-vl-7b-chat
```

#### DeepSeek-VL-1.3B（超轻量版，8GB 显存）
```bash
mkdir -p ~/deepseek-vl/models
cd ~/deepseek-vl/models
huggingface-cli download deepseek-ai/deepseek-vl-1.3b-chat --local-dir ./deepseek-vl-1.3b-chat
```

### 步骤 3：创建 Dockerfile

创建 `~/deepseek-vl/Dockerfile`：

```dockerfile
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu22.04

# 安装 Python 和依赖
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3.10-venv \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 创建虚拟环境
RUN python3.10 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# 安装 PyTorch
RUN pip install --no-cache-dir \
    torch==2.1.0 \
    torchvision==0.16.0 \
    torchaudio==2.1.0 \
    --index-url https://download.pytorch.org/whl/cu118

# 安装依赖
RUN pip install --no-cache-dir \
    transformers==4.36.0 \
    accelerate==0.25.0 \
    pillow==10.1.0 \
    fastapi==0.109.0 \
    uvicorn==0.27.0 \
    python-multipart==0.0.6 \
    bitsandbytes==0.41.0 \
    xformers==0.0.23.post1

# 创建工作目录
WORKDIR /app

# 复制模型（挂载方式）
VOLUME ["/app/models"]

# 复制 API 服务代码
COPY api_server.py /app/

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 步骤 4：创建 API 服务

创建 `~/deepseek-vl/api_server.py`：

```python
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from PIL import Image
import io
import base64

app = FastAPI(title="DeepSeek-VL API")

# 加载模型（使用 4-bit 量化）
MODEL_PATH = "/app/models/deepseek-vl-7b-chat"

print("Loading DeepSeek-VL model...")
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    quantization_config=quantization_config,
    device_map="auto",
    trust_remote_code=True
)
model.eval()
print("Model loaded successfully!")

class ChatRequest(BaseModel):
    messages: List[dict]
    temperature: float = 0.7
    max_tokens: int = 2048

@app.post("/v1/chat/completions")
async def chat_completions(request: ChatRequest):
    try:
        # 构建对话上下文
        conversation = []
        
        for msg in request.messages:
            if msg["role"] == "system":
                conversation.append({"role": msg["role"], "content": msg["content"]})
            elif msg["role"] == "user":
                content = msg["content"]
                if isinstance(content, list):
                    # 处理多模态内容
                    text_parts = []
                    image_urls = []
                    for item in content:
                        if item["type"] == "text":
                            text_parts.append(item["text"])
                        elif item["type"] == "image_url":
                            image_urls.append(item["image_url"]["url"])
                    
                    # 构建输入
                    if image_urls:
                        # 加载图像
                        images = []
                        for url in image_urls:
                            if url.startswith("data:image"):
                                # Base64 编码的图像
                                header, data = url.split(",", 1)
                                image_data = base64.b64decode(data)
                                image = Image.open(io.BytesIO(image_data)).convert("RGB")
                                images.append(image)
                        text = "\n".join(text_parts)
                        conversation.append({
                            "role": "user",
                            "content": text,
                            "images": images
                        })
                    else:
                        conversation.append({"role": "user", "content": "\n".join(text_parts)})
                else:
                    conversation.append({"role": "user", "content": content})
        
        # 生成响应
        response = model.chat(
            tokenizer=tokenizer,
            query=conversation[-1]["content"],
            images=conversation[-1].get("images"),
            temperature=request.temperature,
            max_new_tokens=request.max_tokens,
            do_sample=True
        )
        
        return JSONResponse(content={
            "id": "chatcmpl-" + str(hash(str(conversation))),
            "object": "chat.completion",
            "created": int(torch.time.time() * 1000),
            "model": "deepseek-vl-7b-chat",
            "choices": [{
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": response
                },
                "finish_reason": "stop"
            }],
            "usage": {
                "prompt_tokens": len(conversation),
                "completion_tokens": len(response),
                "total_tokens": len(conversation) + len(response)
            }
        })
    
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/health")
async def health():
    return {"status": "healthy", "model": MODEL_PATH}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 步骤 5：构建和运行 Docker

```bash
cd ~/deepseek-vl

# 构建镜像
docker build -t deepseek-vl:7b-chat .

# 运行容器（挂载模型目录）
docker run -d \
  --name deepseek-vl \
  --gpus all \
  -p 8000:8000 \
  -v ~/deepseek-vl/models:/app/models \
  deepseek-vl:7b-chat

# 查看日志
docker logs -f deepseek-vl
```

### 步骤 6：测试 API

```bash
# 健康检查
curl http://localhost:8000/health

# 测试图像分析
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "你是一位专业的皮肤科医生。"
      },
      {
        "role": "user",
        "content": "请描述这张图片"
      }
    ],
    "temperature": 0.7
  }'
```

---

## 方案二：本地部署

### 步骤 1：创建虚拟环境

```bash
# 创建目录
mkdir -p ~/deepseek-vl
cd ~/deepseek-vl

# 创建虚拟环境
python3.10 -m venv venv
source venv/bin/activate
```

### 步骤 2：安装依赖

```bash
# 安装 PyTorch（CUDA 11.8）
pip install torch==2.1.0 torchvision==0.16.0 torchaudio==2.1.0 --index-url https://download.pytorch.org/whl/cu118

# 安装依赖
pip install transformers==4.36.0 accelerate==0.25.0 pillow==10.1.0
pip install bitsandbytes==0.41.0 xformers==0.0.23.post1
pip install fastapi==0.109.0 uvicorn==0.27.0 python-multipart==0.0.6
```

### 步骤 3：下载模型

```bash
# 创建模型目录
mkdir -p models
cd models

# 使用 huggingface-cli 下载
huggingface-cli download deepseek-ai/deepseek-vl-7b-chat --local-dir ./deepseek-vl-7b-chat
```

### 步骤 4：启动服务

```bash
cd ~/deepseek-vl

# 使用 4-bit 量化启动（推荐）
python -c "
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

MODEL_PATH = 'models/deepseek-vl-7b-chat'

# 4-bit 量化配置
quantization_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_use_double_quant=True,
)

print('Loading model...')
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    quantization_config=quantization_config,
    device_map='auto',
    trust_remote_code=True
)
model.eval()

print('Model loaded!')
print('Starting API server...')

import uvicorn
from api_server import app

uvicorn.run(app, host='0.0.0.0', port=8000)
"
```

---

## 方案三：云端部署

### 阿里云 GPU 实例部署

#### 1. 购买 GPU 实例

- 地域：华东2（上海）或华北2（北京）
- 实例规格：ecs.gn7i-c8g1.2xlarge（1×T4 GPU，16GB显存）
- 操作系统：Ubuntu 22.04

#### 2. 连接实例并安装环境

```bash
# 更新系统
sudo apt-get update

# 安装 Docker（同方案一步骤1）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 NVIDIA Runtime
sudo apt-get install -y nvidia-container-toolkit
sudo systemctl restart docker

# 克隆项目
git clone <你的项目仓库>
cd deepseek-vl

# 构建并运行
docker build -t deepseek-vl:7b-chat .
docker run -d --name deepseek-vl --gpus all -p 8000:8000 -v ~/models:/app/models deepseek-vl:7b-chat
```

#### 3. 配置安全组

在阿里云控制台配置安全组，开放 8000 端口。

---

## API 接口说明

### 健康检查

```http
GET /health
```

**响应**：
```json
{
  "status": "healthy",
  "model": "/app/models/deepseek-vl-7b-chat"
}
```

### 聊天完成

```http
POST /v1/chat/completions
```

**请求体**：
```json
{
  "messages": [
    {
      "role": "system",
      "content": "你是一位专业的皮肤科医生。"
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "请分析这张图片的皮肤状态"
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
          }
        }
      ]
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2048
}
```

**响应**：
```json
{
  "id": "chatcmpl-123456",
  "object": "chat.completion",
  "created": 1699012345,
  "model": "deepseek-vl-7b-chat",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "{\n  \"skinType\": \"混合性皮肤\",\n  \"concerns\": [\"T区油腻\", \"毛孔粗大\"],\n  ..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 256,
    "completion_tokens": 512,
    "total_tokens": 768
  }
}
```

---

## 对接到小程序

完成部署后，修改 `server/src/skin/skin.service.ts` 以对接自部署的 DeepSeek-VL。

### 环境变量配置

在 `server/.env.local` 中添加：

```bash
# DeepSeek-VL 配置
DEEPSEEK_VL_API_URL=http://localhost:8000
DEEPSEEK_VL_MODEL_NAME=deepseek-vl-7b-chat
```

### 代码修改

详见 `修改 skin.service.ts 对接 DeepSeek-VL API` 步骤。

---

## 性能优化

### 1. 使用 vLLM 加速推理

```bash
# 安装 vLLM
pip install vllm

# 使用 vLLM 启动服务
python -m vllm.entrypoints.openai.api_server \
  --model ~/deepseek-vl/models/deepseek-vl-7b-chat \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.9 \
  --port 8000
```

### 2. 启用 Flash Attention

```python
# 在加载模型时添加
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    quantization_config=quantization_config,
    attn_implementation="flash_attention_2",
    device_map="auto",
    trust_remote_code=True
)
```

### 3. 批处理请求

修改 API 服务支持批量处理多个请求。

---

## 常见问题

### Q1: 显存不足怎么办？

**A**：使用 4-bit 量化或更换更小的模型（DeepSeek-VL-1.3B）。

### Q2: 推理速度慢？

**A**：启用 vLLM 加速或使用更高性能的 GPU。

### Q3: 如何更新模型？

**A**：重新下载最新模型，重启容器即可。

### Q4: 支持多 GPU 吗？

**A**：支持，使用 `--tensor-parallel-size` 参数指定 GPU 数量。

---

## 成本估算

### 本地部署

| 资源 | 成本 |
|------|------|
| GPU（二手 RTX 3060） | ¥2000-3000 |
| 电费（24小时运行） | ¥300-500/月 |

### 云端部署

| 实例配置 | 成本 |
|---------|------|
| 1×T4（16GB显存） | ¥2-3/小时 |
| 1×A10（24GB显存） | ¥5-8/小时 |

---

## 参考资源

- DeepSeek-VL 官方仓库：https://github.com/deepseek-ai/DeepSeek-VL
- Hugging Face：https://huggingface.co/deepseek-ai
- vLLM 文档：https://docs.vllm.ai/

---

## 支持

如有问题，请提交 Issue 或联系技术支持。
