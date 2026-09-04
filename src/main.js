import './style.css'
import { initI18n, t } from './i18n.js'

initI18n()

console.log('%cdeveloped by Ibrahim D', 'color:#51741F;font-family:sans-serif;font-size:12px;')

const WEB3FORMS_ACCESS_KEY = '1d4b42d2-74d0-4053-8fcc-2e7dcad053b3'
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const NOTIFY_EMAIL = 'btore25@apec.edu.kz'

const header = document.getElementById('site-header')
function updateHeader() {
  if (window.scrollY > 8) {
    header.classList.add('bg-paper/95', 'backdrop-blur', 'shadow-sm')
  } else {
    header.classList.remove('bg-paper/95', 'backdrop-blur', 'shadow-sm')
  }
}
updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

const navToggle = document.getElementById('nav-toggle')
const mobileNav = document.getElementById('mobile-nav')
const iconOpen = document.getElementById('nav-icon-open')
const iconClose = document.getElementById('nav-icon-close')

navToggle.addEventListener('click', () => {
  const isOpen = !mobileNav.classList.contains('hidden')
  mobileNav.classList.toggle('hidden')
  iconOpen.classList.toggle('hidden')
  iconClose.classList.toggle('hidden')
  navToggle.setAttribute('aria-expanded', String(!isOpen))
})

mobileNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileNav.classList.add('hidden')
    iconOpen.classList.remove('hidden')
    iconClose.classList.add('hidden')
    navToggle.setAttribute('aria-expanded', 'false')
  })
})

document.querySelectorAll('.accordion-item').forEach((item) => {
  const trigger = item.querySelector('.accordion-trigger')
  const panel = item.querySelector('.accordion-panel')

  trigger.addEventListener('click', () => {
    const isOpen = item.getAttribute('data-open') === 'true'
    const next = !isOpen
    item.setAttribute('data-open', String(next))
    trigger.setAttribute('aria-expanded', String(next))
    panel.style.maxHeight = next ? `${panel.scrollHeight}px` : '0'
  })
})

const phoneInput = document.getElementById('phone')
phoneInput.addEventListener('input', (e) => {
  let digits = e.target.value.replace(/\D/g, '')
  if (digits.startsWith('7')) digits = digits.slice(1)
  if (digits.startsWith('8')) digits = digits.slice(1)
  digits = digits.slice(0, 10)

  let out = '+7'
  if (digits.length > 0) out += ` (${digits.slice(0, 3)}`
  if (digits.length >= 3) out += ')'
  if (digits.length > 3) out += ` ${digits.slice(3, 6)}`
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`
  if (digits.length > 8) out += `-${digits.slice(8, 10)}`
  e.target.value = out
})

const bioInput = document.getElementById('bio')
const bioCount = document.getElementById('bio-count')
bioInput.addEventListener('input', () => {
  bioCount.textContent = `${bioInput.value.length} / 300`
})

const form = document.getElementById('apply-form')
const submitBtn = document.getElementById('submit-btn')
const submitLabel = document.getElementById('submit-label')
const formError = document.getElementById('form-error')
const formWrap = document.getElementById('form-wrap')
const successWrap = document.getElementById('success-wrap')

const validators = {
  fullName: (v) => (v.trim().length > 1 ? '' : t('form.error.fullName')),
  institution: (v) => (v.trim().length > 1 ? '' : t('form.error.institution')),
  group: (v) => (v.trim().length > 0 ? '' : t('form.error.group')),
  bio: (v) => (v.trim().length >= 10 ? '' : t('form.error.bio')),
  phone: (v) => (v.replace(/\D/g, '').length >= 11 ? '' : t('form.error.phone')),
  email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : t('form.error.email')),
  consent: (checked) => (checked ? '' : t('form.error.consent')),
}

function showFieldError(name, message) {
  const errorEl = document.getElementById(`${name === 'fullName' ? 'full-name' : name}-error`)
  const inputEl = form.elements[name]
  if (!errorEl) return
  if (message) {
    errorEl.textContent = message
    errorEl.classList.remove('hidden')
    if (inputEl && inputEl.classList) inputEl.classList.add('border-red-400')
  } else {
    errorEl.textContent = ''
    errorEl.classList.add('hidden')
    if (inputEl && inputEl.classList) inputEl.classList.remove('border-red-400')
  }
}

function validateField(name) {
  const validator = validators[name]
  if (!validator) return true
  const field = form.elements[name]
  const value = name === 'consent' ? field.checked : field.value
  const message = validator(value)
  showFieldError(name, message)
  return !message
}

;['fullName', 'institution', 'group', 'bio', 'phone', 'email'].forEach((name) => {
  form.elements[name].addEventListener('blur', () => validateField(name))
})
form.elements.consent.addEventListener('change', () => validateField('consent'))

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  formError.classList.add('hidden')

  if (form.elements.company.value) {
    showSuccess()
    return
  }

  const fieldsToValidate = ['fullName', 'institution', 'group', 'bio', 'phone', 'email', 'consent']
  const results = fieldsToValidate.map(validateField)
  if (!results.every(Boolean)) {
    const firstInvalid = fieldsToValidate.find((_, i) => !results[i])
    form.elements[firstInvalid]?.focus()
    return
  }

  const interests = Array.from(form.querySelectorAll('input[name="interests"]:checked')).map((el) => el.value)

  const fullName = form.elements.fullName.value.trim()
  const applicantEmail = form.elements.email.value.trim()
  const payload = {
    fullName,
    institution: form.elements.institution.value.trim(),
    group: form.elements.group.value.trim(),
    email: applicantEmail,
    phone: form.elements.phone.value.trim(),
    bio: form.elements.bio.value.trim(),
    interests: interests.join(', '),
  }

  submitBtn.disabled = true
  submitLabel.textContent = t('form.submitting')

  try {
    if (WEB3FORMS_ACCESS_KEY) {
      const res = await fetch(WEB3FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_ACCESS_KEY,
          to: NOTIFY_EMAIL,
          subject: `New volunteer application — ${fullName}`,
          from_name: fullName,
          replyto: applicantEmail || undefined,
          ...payload,
        }),
      })
      const result = await res.json()
      if (!res.ok || !result.success) throw new Error('Request failed')
    } else {
      console.info('Application submitted (no WEB3FORMS_ACCESS_KEY configured):', payload)
    }
    showSuccess()
  } catch (err) {
    formError.textContent = t('form.error.generic')
    formError.classList.remove('hidden')
    submitBtn.disabled = false
    submitLabel.textContent = t('form.submit')
  }
})

function showSuccess() {
  formWrap.classList.add('hidden')
  successWrap.classList.remove('hidden')
  successWrap.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
