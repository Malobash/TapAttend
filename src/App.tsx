import { FormEvent, useEffect, useRef, useState } from 'react'
import { loginStudent, registerStudent, resetStudentAccount, sendTeacherLoginHistoryEmail } from './api'

const defaultMessage = 'Use your student ID and campus password to continue.'
const defaultTeacherEmail = 'o.khoury@ahliahschool.edu.lb'

const defaultForm = {
  studentId: '',
  password: '',
  rememberMe: true,
}

const defaultRegisterForm = {
  studentId: '',
  fullName: '',
  email: '',
  password: '',
  isTeacher: false,
}

const defaultForgotForm = {
  studentId: '',
}

export default function App() {
  const [form, setForm] = useState(defaultForm)
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm)
  const [forgotForm, setForgotForm] = useState(defaultForgotForm)
  const [teacherEmail, setTeacherEmail] = useState(defaultTeacherEmail)
  const [message, setMessage] = useState(defaultMessage)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'thank-you' | 'teacher'>('login')
  const [loggedUserName, setLoggedUserName] = useState('')
  const returnTimerRef = useRef<number | null>(null)

  useEffect(
    () => () => {
      if (returnTimerRef.current !== null) {
        globalThis.clearTimeout(returnTimerRef.current)
      }
    },
    [],
  )

  const getPageTitle = () => {
    if (mode === 'login') {
      return 'Sign in'
    }

    if (mode === 'register') {
      return 'Register'
    }

    if (mode === 'forgot') {
      return 'Forgot password'
    }

    return 'Thank you'
  }

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await loginStudent({
        studentId: form.studentId,
        password: form.password,
      })

      setLoggedUserName(result.fullName)
      setMessage(`Welcome back, ${result.fullName}. ${result.message}.`)

      if (result.role === 'TEACHER') {
        if (returnTimerRef.current !== null) {
          globalThis.clearTimeout(returnTimerRef.current)
        }

        setTeacherEmail(defaultTeacherEmail)
        setMode('teacher')
        return
      }

      setMode('thank-you')

      if (returnTimerRef.current !== null) {
        globalThis.clearTimeout(returnTimerRef.current)
      }

      returnTimerRef.current = globalThis.setTimeout(() => {
        setMode('login')
        setLoggedUserName('')
        setForm(defaultForm)
        setMessage(defaultMessage)
      }, 5000)
    } catch (error) {
      const fallback = 'Login failed. Check your student ID and password.'
      setMessage(error instanceof Error ? error.message : fallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await registerStudent({
        studentId: registerForm.studentId,
        fullName: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.isTeacher ? 'TEACHER' : 'STUDENT',
      })

      setMessage(
        `Registration successful for ${result.fullName}. ${registerForm.isTeacher ? 'Teacher' : 'Student'} account created. Please sign in.`,
      )
      setMode('login')
      setForm((current) => ({
        ...current,
        studentId: registerForm.studentId,
        password: '',
      }))
      setRegisterForm(defaultRegisterForm)
    } catch (error) {
      const fallback = 'Registration failed. Please verify your details and try again.'
      setMessage(error instanceof Error ? error.message : fallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await resetStudentAccount(forgotForm.studentId)
      setMessage('Account reset completed. Please register again.')
      setRegisterForm({ ...defaultRegisterForm, studentId: forgotForm.studentId })
      setForgotForm(defaultForgotForm)
      setMode('register')
    } catch (error) {
      const fallback = 'Reset failed. Please confirm your Student ID and try again.'
      setMessage(error instanceof Error ? error.message : fallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTeacherEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await sendTeacherLoginHistoryEmail({
        recipientEmail: teacherEmail,
      })

      setMessage(
        `Login history email sent to ${result.recipientEmail} with ${result.loginCount} records for ${result.reportDate}.`,
      )
    } catch (error) {
      const fallback = 'Failed to send the teacher email report.'
      setMessage(error instanceof Error ? error.message : fallback)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="shell">
      <section className="login-card" aria-labelledby="student-login-heading">
        <div className="login-card__header">
          <p className="eyebrow">Student access</p>
          <h2 id="student-login-heading">{getPageTitle()}</h2>
          <span>{message}</span>
        </div>

        {mode === 'login' && (
          <form className="login-form" onSubmit={handleLoginSubmit}>
            <label>
              <span>Student ID</span>
              <input
                type="text"
                name="studentId"
                placeholder="2026-STD-0142"
                value={form.studentId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, studentId: event.target.value }))
                }
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                required
              />
            </label>

            <div className="login-form__meta">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, rememberMe: event.target.checked }))
                  }
                />
                <span>Keep me signed in</span>
              </label>

              <a
                href="/"
                onClick={(event) => {
                  event.preventDefault()
                  setMode('forgot')
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Present attendance'}
            </button>
            <button
              type="button"
              className="login-form__secondary-button"
              onClick={() => setMode('register')}
              disabled={isSubmitting}
            >
              Register
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form className="login-form" onSubmit={handleRegisterSubmit}>
            <label>
              <span>Student ID</span>
              <input
                type="text"
                name="registerStudentId"
                placeholder="2026-STD-0200"
                value={registerForm.studentId}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, studentId: event.target.value }))
                }
                required
              />
            </label>

            <label>
              <span>Full Name</span>
              <input
                type="text"
                name="fullName"
                placeholder="Student full name"
                value={registerForm.fullName}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, fullName: event.target.value }))
                }
                required
              />
            </label>

            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                placeholder="name@campus.edu"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                name="registerPassword"
                placeholder="Create a password"
                value={registerForm.password}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, password: event.target.value }))
                }
                required
                minLength={4}
              />
            </label>

            <label className="toggle-switch">
              <span>Teacher account</span>
              <span className="toggle-switch__control">
                <input
                  type="checkbox"
                  checked={registerForm.isTeacher}
                  onChange={(event) =>
                    setRegisterForm((current) => ({
                      ...current,
                      isTeacher: event.target.checked,
                    }))
                  }
                />
                <span aria-hidden="true" className="toggle-switch__track" />
              </span>
              <small>{registerForm.isTeacher ? 'Teacher access enabled' : 'Register as student'}</small>
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
            <button
              type="button"
              className="login-form__secondary-button"
              onClick={() => setMode('login')}
              disabled={isSubmitting}
            >
              Back to login
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form className="login-form" onSubmit={handleForgotSubmit}>
            <label>
              <span>Student ID</span>
              <input
                type="text"
                name="forgotStudentId"
                placeholder="Enter your student ID"
                value={forgotForm.studentId}
                onChange={(event) =>
                  setForgotForm((current) => ({ ...current, studentId: event.target.value }))
                }
                required
              />
            </label>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </button>
            <button
              type="button"
              className="login-form__secondary-button"
              onClick={() => setMode('login')}
              disabled={isSubmitting}
            >
              Back to login
            </button>
          </form>
        )}

        {mode === 'thank-you' && (
          <section className="thank-you-panel" aria-live="polite">
            <h3>Thank you, {loggedUserName || 'student'}.</h3>
            <p>Your attendance has been recorded successfully.</p>
          </section>
        )}

        {mode === 'teacher' && (
          <section className="teacher-panel" aria-live="polite">
            <h3>Teacher tools</h3>
            <p>Send today&apos;s login history to the email address below.</p>

            <form className="login-form teacher-panel__form" onSubmit={handleTeacherEmailSubmit}>
              <label>
                <span>Recipient email</span>
                <input
                  type="email"
                  name="teacherEmail"
                  value={teacherEmail}
                  onChange={(event) => setTeacherEmail(event.target.value)}
                  required
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending email...' : 'Send login history email'}
              </button>
            </form>
          </section>
        )}

      </section>
    </main>
  )
}