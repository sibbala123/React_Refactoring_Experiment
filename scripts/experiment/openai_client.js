import OpenAI from 'openai'

function parseNumberEnv(name, fallback) {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function extractTextFromResponse(response) {
  if (response?.output_text) return response.output_text
  const chunks = []
  const output = Array.isArray(response?.output) ? response.output : []
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : []
    for (const part of content) {
      if (part?.type === 'output_text' && typeof part?.text === 'string') {
        chunks.push(part.text)
      }
    }
  }
  return chunks.join('\n').trim()
}

function extractTextFromChatCompletion(completion) {
  const content = completion?.choices?.[0]?.message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part?.type === 'text' && typeof part?.text === 'string') return part.text
        return ''
      })
      .join('\n')
      .trim()
  }
  return ''
}

function normalizeBaseUrl(baseURL) {
  return (baseURL || '').trim().toLowerCase()
}

function isOllamaOpenAIEndpoint(baseURL) {
  const normalized = normalizeBaseUrl(baseURL)
  return normalized.includes('localhost:11434') || normalized.includes('127.0.0.1:11434')
}

function createClient() {
  const apiKey = process.env.OPENAI_API_KEY || 'ollama'
  const baseURL = process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1'
  const timeout = Math.floor(parseNumberEnv('OPENAI_TIMEOUT_MS', 300000))
  const options = { apiKey, baseURL, timeout }
  return new OpenAI(options)
}

export async function generatePatch(promptText) {
  const client = createClient()
  const model = process.env.OPENAI_MODEL || 'gpt-5-mini'
  const maxOutputTokens = Math.floor(parseNumberEnv('OPENAI_MAX_OUTPUT_TOKENS', 4000))
  const temperature = parseNumberEnv('OPENAI_TEMPERATURE', 0.2)
  const baseURL = process.env.OPENAI_BASE_URL || 'http://localhost:11434/v1'
  const forceResponses = process.env.OPENAI_USE_RESPONSES === '1'
  const forceChat = process.env.OPENAI_USE_CHAT_COMPLETIONS === '1'
  const defaultToChat = isOllamaOpenAIEndpoint(baseURL) && !forceResponses
  const useChatCompletions = forceChat || defaultToChat

  if (useChatCompletions) {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptText }],
      max_tokens: maxOutputTokens,
      temperature,
    })
    return extractTextFromChatCompletion(completion)
  }

  try {
    const response = await client.responses.create({
      model,
      input: promptText,
      max_output_tokens: maxOutputTokens,
      temperature,
    })
    return extractTextFromResponse(response)
  } catch (err) {
    if (!isOllamaOpenAIEndpoint(baseURL)) {
      throw err
    }
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: promptText }],
      max_tokens: maxOutputTokens,
      temperature,
    })
    return extractTextFromChatCompletion(completion)
  }
}
