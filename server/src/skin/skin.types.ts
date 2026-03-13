export interface SkinAnalysisResult {
  skinType: string;
  concerns: string[];
  moisture: number;
  oiliness: number;
  sensitivity: number;
  recommendations: string[];
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  path?: string;
  buffer?: Buffer;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  tags: string[];
}
