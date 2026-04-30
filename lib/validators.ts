import { z } from "zod"

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export const regionFilterSchema = z.object({
  regionId: z.string().min(1).optional(),
  crop: z.string().optional(),
  riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
})

export const predictionQuerySchema = paginationSchema.merge(regionFilterSchema).extend({
  timeframe: z.enum(["7d", "14d", "30d"]).default("7d"),
  diseaseType: z.enum(["all", "fungal", "bacterial", "viral"]).default("all"),
  sortBy: z.enum(["onset", "confidence", "risk"]).default("onset"),
})

export const alertQuerySchema = paginationSchema.extend({
  severity: z.enum(["info", "warning", "critical", "success"]).optional(),
  category: z.enum(["disease", "weather", "system", "prediction"]).optional(),
  read: z.coerce.boolean().optional(),
  actionRequired: z.coerce.boolean().optional(),
})

export const alertPreferenceSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  criticalEnabled: z.boolean(),
  warningEnabled: z.boolean(),
  infoEnabled: z.boolean(),
  quietHoursStart: z.string().nullable(),
  quietHoursEnd: z.string().nullable(),
})

export const uploadImageSchema = z.object({
  cropType: z.string().min(1, "Crop type is required"),
  regionId: z.string().min(1, "Region is required").optional(),
  notes: z.string().max(1000).optional(),
})

export const uploadDataSchema = z.object({
  dataType: z.enum(["weather", "soil_moisture", "temperature", "custom"]),
  regionId: z.string().min(1, "Region is required"),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["farmer", "agronomist", "researcher"]).default("farmer"),
})

export const regionCreateSchema = z.object({
  name: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  areaHa: z.number().positive().optional(),
  description: z.string().max(500).optional(),
})

export const notificationMarkReadSchema = z.object({
  notificationIds: z.array(z.string().min(1)).min(1).max(100),
})

export type PredictionQuery = z.infer<typeof predictionQuerySchema>
export type AlertQuery = z.infer<typeof alertQuerySchema>
export type AlertPreferenceInput = z.infer<typeof alertPreferenceSchema>
export type UploadImageInput = z.infer<typeof uploadImageSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
