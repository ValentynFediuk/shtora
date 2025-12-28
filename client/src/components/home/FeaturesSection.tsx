import { Truck, Shield, CreditCard, Headphones, RefreshCw, Award } from 'lucide-react'

const features = [
  {
    icon: Truck,
    title: 'Швидка доставка',
    description: 'Доставка по всій Україні за 1-2 дні. Безкоштовно від 2000 ₴',
  },
  {
    icon: Shield,
    title: 'Гарантія якості',
    description: 'Сертифіковані товари від офіційних виробників',
  },
  {
    icon: CreditCard,
    title: 'Зручна оплата',
    description: 'Оплата карткою, LiqPay або накладеним платежем',
  },
  {
    icon: Headphones,
    title: 'Підтримка 24/7',
    description: 'Консультації та допомога у виборі товарів',
  },
  {
    icon: RefreshCw,
    title: 'Легке повернення',
    description: '14 днів на повернення або обмін товару',
  },
  {
    icon: Award,
    title: '10 років досвіду',
    description: 'Більше 50 000 задоволених клієнтів',
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-secondary-50 py-12 md:py-16">
      <div className="container">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">Чому обирають нас</h2>
          <p className="text-secondary-600">
            SHTORA — це надійність, якість та сервіс на найвищому рівні
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-100">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-secondary-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-secondary-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
