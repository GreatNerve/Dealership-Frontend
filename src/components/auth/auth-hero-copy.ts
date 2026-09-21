export type AuthHeroVariant = 'login' | 'register' | 'customer' | 'dealership'

export const HERO_COPY: Record<
  AuthHeroVariant,
  { image: string; title: string; subtitle: string }
> = {
  login: {
    image: '/images/auth/login.jpg',
    title: 'Welcome back',
    subtitle: 'Sign in to manage appointments, vehicles, and reminders.',
  },
  register: {
    image: '/images/auth/register.jpg',
    title: 'Create your account',
    subtitle: 'Pick customer or dealership — we only ask what each path needs.',
  },
  customer: {
    image: '/images/auth/customer.jpg',
    title: 'Customer registration',
    subtitle: 'Book service and manage your vehicles online.',
  },
  dealership: {
    image: '/images/auth/dealership.jpg',
    title: 'Dealership setup',
    subtitle: 'Staff login and your shop profile in one flow.',
  },
}

export function authHeroVariant(pathname: string): AuthHeroVariant {
  if (pathname.includes('/register/dealership')) return 'dealership'
  if (pathname.includes('/register/customer')) return 'customer'
  if (pathname.startsWith('/register')) return 'register'
  return 'login'
}
