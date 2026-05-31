export type LoginPayload = {
  studentId: string
  password: string
}

export type RegisterPayload = {
  studentId: string
  fullName: string
  email: string
  password: string
  role: string
}

export type TeacherLoginHistoryEmailPayload = {
  recipientEmail: string
}

export type LoginResult = {
  message: string
  id: number
  studentId: string
  fullName: string
  role: string
}

export type RegisterResult = {
  id: number
  studentId: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

export type TeacherLoginHistoryEmailResult = {
  message: string
  recipientEmail: string
  loginCount: number
  reportDate: string
}

export async function loginStudent(payload: LoginPayload): Promise<LoginResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Login request failed:', errorText)
    throw new Error(errorText || 'Login request failed')
  }

  return response.json() as Promise<LoginResult>
}

export async function registerStudent(payload: RegisterPayload): Promise<RegisterResult> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Registration request failed')
  }

  return response.json() as Promise<RegisterResult>
}

export async function resetStudentAccount(studentId: string): Promise<void> {
  const encodedStudentId = encodeURIComponent(studentId)
  const response = await fetch(`/api/users/by-student-id/${encodedStudentId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Reset password request failed')
  }
}

export async function sendTeacherLoginHistoryEmail(
  payload: TeacherLoginHistoryEmailPayload,
): Promise<TeacherLoginHistoryEmailResult> {
  const response = await fetch('/api/users/teacher/login-history-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Send email request failed')
  }

  return response.json() as Promise<TeacherLoginHistoryEmailResult>
}