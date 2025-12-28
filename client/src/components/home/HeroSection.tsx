import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container py-12 md:py-20 lg:py-28">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Content */}
          <div className="text-center lg:text-left">
            <span className="mb-4 inline-block rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
              🎄 Новорічний розпродаж до -50%
            </span>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-secondary-900 md:text-5xl lg:text-6xl">
              Створіть затишок
              <span className="text-primary-600"> у вашому домі</span>
            </h1>
            <p className="mb-8 text-lg text-secondary-600 md:text-xl">
              Великий вибір штор, тюлів та карнизів від провідних виробників. 
              Доставка по всій Україні за 1-2 дні.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/catalog" className="btn-primary px-8 py-3 text-base">
                Перейти до каталогу
              </Link>
              <Link href="/sales" className="btn-outline px-8 py-3 text-base">
                Акційні пропозиції
              </Link>
            </div>
            {/* Features */}
            <div className="mt-10 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div>
                <p className="text-2xl font-bold text-primary-600">5000+</p>
                <p className="text-sm text-secondary-500">товарів</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">10K+</p>
                <p className="text-sm text-secondary-500">клієнтів</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary-600">4.9★</p>
                <p className="text-sm text-secondary-500">рейтинг</p>
              </div>
            </div>
          </div>

          {/* Image placeholder */}
          <div className="relative hidden lg:block">
            <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-primary-200 to-primary-100">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl">🏠</span>
                  <p className="mt-4 text-lg font-medium text-primary-700">
                    Зображення інтер&apos;єру
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-xl bg-primary-500 opacity-20" />
            <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-secondary-300 opacity-30" />
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 60V30C240 0 480 0 720 30C960 60 1200 60 1440 30V60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
