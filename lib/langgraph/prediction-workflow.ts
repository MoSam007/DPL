import { Annotation, StateGraph, START, END } from "@langchain/langgraph"
import { ChatGroq } from "@langchain/groq"
import { z } from "zod"
import type { Region, WeatherSnapshot, Prediction } from "@/lib/types"

// ---------------------------------------------------------------------------
// Schema for structured LLM output
// ---------------------------------------------------------------------------

const DiseaseRiskSchema = z.object({
  predictions: z
    .array(
      z.object({
        diseaseName: z.string().describe("Common name of the crop disease"),
        diseaseType: z.enum(["fungal", "bacterial", "viral", "nematode", "other"]),
        riskLevel: z.enum(["low", "medium", "high", "critical"]),
        confidence: z.number().min(0).max(100).describe("Confidence percentage (0–100)"),
        trend: z
          .enum(["up", "down", "stable"])
          .describe("Whether risk is increasing, decreasing, or stable"),
        factors: z
          .array(z.string())
          .min(1)
          .max(4)
          .describe("Key weather/environmental contributing factors"),
        action: z.string().describe("Specific, actionable recommendation for the farmer"),
        onsetDays: z
          .number()
          .min(1)
          .max(14)
          .describe("Estimated days until disease onset from today"),
      })
    )
    .min(1)
    .max(3)
    .describe("Top 1–3 crop disease risks for this region"),
})

type DiseaseRisks = z.infer<typeof DiseaseRiskSchema>["predictions"]

// ---------------------------------------------------------------------------
// Graph state
// ---------------------------------------------------------------------------

const GraphState = Annotation.Root({
  region: Annotation<Region>,
  weather: Annotation<WeatherSnapshot>,
  diseaseRisks: Annotation<DiseaseRisks | null>,
  predictions: Annotation<Prediction[]>,
})

type State = typeof GraphState.State

// ---------------------------------------------------------------------------
// LLM (instantiated lazily so missing API key only errors at call time)
// ---------------------------------------------------------------------------

function getLLM() {
  return new ChatGroq({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    temperature: 0.1,
    apiKey: process.env.GROQ_API_KEY,
  }).withStructuredOutput(DiseaseRiskSchema)
}

// ---------------------------------------------------------------------------
// Nodes
// ---------------------------------------------------------------------------

async function analyzeRisk(state: State): Promise<Partial<State>> {
  const { region, weather } = state

  const llm = getLLM()

  const result = await llm.invoke([
    {
      role: "system",
      content: `You are CropGuard AI, an expert agricultural disease prediction system focused on India.
Analyze current weather conditions to predict the most likely crop disease risks over the next 14 days.
Draw on knowledge of diseases common to Indian agriculture such as Late Blight, Powdery Mildew,
Bacterial Wilt, Rust, Brown Spot, Sheath Blight, Yellow Mosaic Virus, Downy Mildew, and Anthracnose.
Your predictions must be evidence-based, tightly connected to the provided weather data, and produce
actionable farmer-facing recommendations with realistic confidence scores.`,
    },
    {
      role: "user",
      content: `Assess disease risk for the ${region.name} region (${region.latitude}°N, ${region.longitude}°E, ~${region.areaHa ?? "unknown"} ha).

Current weather:
  Temperature : ${weather.temperature}°C
  Humidity    : ${weather.humidity}%
  Rainfall    : ${weather.rainfall} mm (48h forecast)
  Wind Speed  : ${weather.windSpeed != null ? `${weather.windSpeed} km/h` : "unavailable"}
  Pressure    : ${weather.pressure != null ? `${weather.pressure} hPa` : "unavailable"}

Return the 1–3 most probable crop disease threats with risk levels, confidence, trend, causal factors, and concrete farmer actions.`,
    },
  ])

  return { diseaseRisks: result.predictions }
}

function buildPredictions(state: State): Partial<State> {
  const { region, diseaseRisks } = state
  if (!diseaseRisks?.length) return { predictions: [] }

  const now = new Date()

  const predictions: Prediction[] = diseaseRisks.map((risk) => {
    const slug = risk.diseaseName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

    const onset = new Date(now.getTime() + risk.onsetDays * 86_400_000)
    const validTo = new Date(now.getTime() + 14 * 86_400_000)

    return {
      id: `pred_${region.id}_${slug}_${now.getTime()}`,
      regionId: region.id,
      region,
      disease: {
        id: `dis_${slug}`,
        name: risk.diseaseName,
        slug,
        type: risk.diseaseType,
      },
      riskLevel: risk.riskLevel,
      confidence: risk.confidence,
      trend: risk.trend,
      predictedOnset: onset.toISOString(),
      validFrom: now.toISOString(),
      validTo: validTo.toISOString(),
      factors: risk.factors,
      action: risk.action,
      modelVersion: "langgraph-v1.0",
      createdAt: now.toISOString(),
    }
  })

  return { predictions }
}

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

const graph = new StateGraph(GraphState)
  .addNode("analyze_risk", analyzeRisk)
  .addNode("build_predictions", buildPredictions)
  .addEdge(START, "analyze_risk")
  .addEdge("analyze_risk", "build_predictions")
  .addEdge("build_predictions", END)
  .compile()

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function runPredictionWorkflow(
  region: Region,
  weather: WeatherSnapshot
): Promise<Prediction[]> {
  if (!process.env.GROQ_API_KEY) {
    console.warn(`[CropGuard] GROQ_API_KEY not set — skipping prediction for ${region.name}`)
    return []
  }

  const result = await graph.invoke({
    region,
    weather,
    diseaseRisks: null,
    predictions: [],
  })

  return result.predictions
}
