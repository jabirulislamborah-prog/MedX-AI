/**
 * Security Validation Utilities
 * Implements defense-in-depth input validation and sanitization
 */

// ===== CONSTANTS =====

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'text/plain',
  'text/csv'
]

// Maximum file sizes (in bytes)
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_PDF_SIZE = 25 * 1024 * 1024 // 25MB
const MAX_TEXT_SIZE = 10 * 1024 * 1024 // 10MB

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['pdf', 'pptx', 'ppt', 'docx', 'doc', 'xlsx', 'xls', 'txt', 'csv']

// Dangerous patterns for input sanitization
const DANGEROUS_PATTERNS = {
  // SQL Injection patterns
  sql: [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/i,
    /(;|\-\-|\/\*|\*\/|@@|char|nvarchar|varchar|table)/i,
    /(0x[0-9a-fA-F]+)/,
  ],
  // XSS patterns
  xss: [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript\s*:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<svg.*onload/gi,
    /data\s*:/gi,
    /expression\s*\(/gi,
  ],
  // Command injection patterns
  command: [
    /[;&|`$]/,
    /\b(cat|ls|pwd|whoami|wget|curl|rm|mkdir|chmod|chown|echo|print|exec|eval)\b/i,
    /\b(nc|netcat|nmap|ssh|scp|ftp)\b/i,
  ],
  // Path traversal patterns
  pathTraversal: [
    /\.\.\//,
    /^\/[a-zA-Z0-9_]+\/\.\.\//,
    /%2e%2e/i,
    /%2f/i,
  ],
  // LDAP injection patterns
  ldap: [
    /[()=*,\]#]/,
    /\b(cn|dn|uid|objectClass)\b/i,
  ],
}

// ===== INPUT VALIDATION =====

/**
 * Validate and sanitize string input
 * @param {string} input - Input to validate
 * @param {object} options - Validation options
 * @returns {object} - { valid: boolean, sanitized: string, error: string }
 */
export function validateString(input, options = {}) {
  const {
    minLength = 0,
    maxLength = 10000,
    allowHTML = false,
    allowSpecialChars = false,
    pattern = null,
    name = 'input'
  } = options

  // Type check
  if (typeof input !== 'string') {
    return { valid: false, sanitized: '', error: `${name} must be a string` }
  }

  // Empty check
  if (!input || input.trim().length === 0) {
    if (minLength > 0) {
      return { valid: false, sanitized: '', error: `${name} is required` }
    }
    return { valid: true, sanitized: '', error: '' }
  }

  // Length check
  if (input.length < minLength) {
    return { valid: false, sanitized: '', error: `${name} must be at least ${minLength} characters` }
  }

  if (input.length > maxLength) {
    return { valid: false, sanitized: '', error: `${name} must be at most ${maxLength} characters` }
  }

  // HTML check
  if (!allowHTML) {
    const htmlPattern = /<[^>]*>/g
    if (htmlPattern.test(input)) {
      return { valid: false, sanitized: '', error: `${name} cannot contain HTML` }
    }
  }

  // Special character check
  if (!allowSpecialChars) {
    // Remove potential injection characters
    const sanitized = input
      .replace(/[<>'";&|`$]/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .trim()
    
    if (sanitized !== input) {
      return { valid: false, sanitized: '', error: `${name} contains invalid characters` }
    }
  }

  // Custom pattern check
  if (pattern && !pattern.test(input)) {
    return { valid: false, sanitized: '', error: `${name} has invalid format` }
  }

  return { valid: true, sanitized: input, error: '' }
}

/**
 * Validate email address
 */
export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const result = validateString(email, { 
    minLength: 5, 
    maxLength: 255, 
    pattern: emailPattern,
    name: 'Email' 
  })
  
  if (!result.valid) return result
  
  // Additional email security checks
  const dangerousEmails = [
    /^\//,  // Starts with /
    /\./,   // Multiple dots
    /@.*@/, // Double @
  ]
  
  for (const pattern of dangerousEmails) {
    if (pattern.test(email)) {
      return { valid: false, sanitized: '', error: 'Invalid email format' }
    }
  }
  
  return { valid: true, sanitized: email.toLowerCase().trim(), error: '' }
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' }
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' }
  }
  
  // Check for common patterns
  const commonPasswords = ['password', '12345678', 'qwerty', 'admin', 'letmein']
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'Password is too common' }
  }
  
  return { valid: true, error: '' }
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid) {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return {
    valid: uuidPattern.test(uuid),
    sanitized: uuid,
    error: uuidPattern.test(uuid) ? '' : 'Invalid ID format'
  }
}

/**
 * Validate numeric input
 */
export function validateNumber(value, options = {}) {
  const { min = -Infinity, max = Infinity, name = 'value' } = options
  
  const num = parseInt(value, 10)
  
  if (isNaN(num)) {
    return { valid: false, error: `${name} must be a number` }
  }
  
  if (num < min || num > max) {
    return { valid: false, error: `${name} must be between ${min} and ${max}` }
  }
  
  return { valid: true, sanitized: num, error: '' }
}

// ===== FILE UPLOAD VALIDATION =====

/**
 * Validate file upload
 * @param {File} file - File object from form data
 * @returns {object} - { valid: boolean, error: string, sanitizedName: string }
 */
export function validateFileUpload(file) {
  if (!file || typeof file !== 'object') {
    return { valid: false, error: 'Invalid file object', sanitizedName: '' }
  }

  const fileName = file.name || ''
  const fileSize = file.size || 0
  const mimeType = file.type || ''

  // Validate filename
  if (!fileName || fileName.length === 0) {
    return { valid: false, error: 'Filename is required', sanitizedName: '' }
  }

  // Sanitize filename - remove dangerous characters
  const sanitizedName = fileName
    .replace(/[^\w\s\-\.]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 255)

  // Get file extension
  const extension = sanitizedName.split('.').pop()?.toLowerCase() || ''

  // Check extension
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'File type not allowed', sanitizedName }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: 'Invalid file MIME type', sanitizedName }
  }

  // Check file size based on type
  let maxSize = MAX_FILE_SIZE
  if (mimeType === 'application/pdf') {
    maxSize = MAX_PDF_SIZE
  } else if (mimeType.startsWith('text/')) {
    maxSize = MAX_TEXT_SIZE
  }

  if (fileSize > maxSize) {
    return { valid: false, error: `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`, sanitizedName }
  }

  if (fileSize === 0) {
    return { valid: false, error: 'File is empty', sanitizedName }
  }

  // Check for path traversal in filename
  if (DANGEROUS_PATTERNS.pathTraversal.some(pattern => pattern.test(sanitizedName))) {
    return { valid: false, error: 'Invalid filename', sanitizedName }
  }

  return { valid: true, sanitizedName, error: '' }
}

/**
 * Validate JSON input
 */
export function validateJSON(input, maxDepth = 10, maxSize = 1000000) {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Invalid JSON input' }
  }

  if (input.length > maxSize) {
    return { valid: false, error: 'JSON input too large' }
  }

  try {
    const parsed = JSON.parse(input)
    
    // Check depth
    function getDepth(obj, currentDepth = 1) {
      if (currentDepth > maxDepth) return currentDepth
      if (typeof obj !== 'object' || obj === null) return currentDepth
      const values = Object.values(obj)
      if (values.length === 0) return currentDepth
      return Math.max(...values.map(v => getDepth(v, currentDepth + 1)))
    }
    
    const depth = getDepth(parsed)
    if (depth > maxDepth) {
      return { valid: false, error: 'JSON structure too deep' }
    }

    return { valid: true, data: parsed, error: '' }
  } catch (e) {
    return { valid: false, error: 'Invalid JSON format' }
  }
}

// ===== INJECTION PREVENTION =====

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input

  let sanitized = input

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '')
  
  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F]/g, '')
  
  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  return sanitized
}

/**
 * Check for SQL injection patterns
 */
export function containsSQLInjection(input) {
  if (typeof input !== 'string') return false
  return DANGEROUS_PATTERNS.sql.some(pattern => pattern.test(input))
}

/**
 * Check for XSS patterns
 */
export function containsXSS(input) {
  if (typeof input !== 'string') return false
  return DANGEROUS_PATTERNS.xss.some(pattern => pattern.test(input))
}

/**
 * Check for command injection patterns
 */
export function containsCommandInjection(input) {
  if (typeof input !== 'string') return false
  return DANGEROUS_PATTERNS.command.some(pattern => pattern.test(input))
}

/**
 * Check for path traversal patterns
 */
export function containsPathTraversal(input) {
  if (typeof input !== 'string') return false
  return DANGEROUS_PATTERNS.pathTraversal.some(pattern => pattern.test(input))
}

// ===== API INPUT VALIDATION =====

/**
 * Validate API request body
 */
export function validateRequestBody(schema, body) {
  const errors = []
  const sanitized = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field]
    
    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`)
      continue
    }
    
    // Skip validation if not provided and not required
    if (value === undefined || value === null) {
      continue
    }

    // Type validation
    if (rules.type === 'string') {
      const result = validateString(value, {
        minLength: rules.minLength || 0,
        maxLength: rules.maxLength || 10000,
        allowHTML: rules.allowHTML || false,
        allowSpecialChars: rules.allowSpecialChars || false,
        name: field
      })
      if (!result.valid) {
        errors.push(result.error)
      } else {
        sanitized[field] = result.sanitized
      }
    } else if (rules.type === 'email') {
      const result = validateEmail(value)
      if (!result.valid) {
        errors.push(result.error)
      } else {
        sanitized[field] = result.sanitized
      }
    } else if (rules.type === 'number') {
      const result = validateNumber(value, {
        min: rules.min || -Infinity,
        max: rules.max || Infinity,
        name: field
      })
      if (!result.valid) {
        errors.push(result.error)
      } else {
        sanitized[field] = result.sanitized
      }
    } else if (rules.type === 'uuid') {
      const result = validateUUID(value)
      if (!result.valid) {
        errors.push(result.error)
      } else {
        sanitized[field] = result.sanitized
      }
    } else if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${field} must be an array`)
      } else if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must have at most ${rules.maxLength} items`)
      } else {
        sanitized[field] = value
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized,
    isValid: () => errors.length === 0,
    getErrors: () => errors
  }
}

// ===== EXPORTS =====

export default {
  validateString,
  validateEmail,
  validatePassword,
  validateUUID,
  validateNumber,
  validateFileUpload,
  validateJSON,
  sanitizeInput,
  containsSQLInjection,
  containsXSS,
  containsCommandInjection,
  containsPathTraversal,
  validateRequestBody,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
}
