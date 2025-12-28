import Link from 'next/link'

const categories = [
  {
    name: 'Штори',
    slug: 'shtory',
    description: 'Класичні та сучасні штори',
    icon: '🪟',
    color: 'from-amber-100 to-amber-50',
    count: 1250,
  },
  {
    name: 'Тюль',
    slug: 'tiul',
    description: 'Легкі та повітряні тюлі',
    icon: '✨',
    color: 'from-blue-100 to-blue-50',
    count: 890,
  },
  {
    name: 'Карнизи',
    slug: 'karnyzy',
    description: 'Металеві та дерев\'яні',
    icon: '🔩',
    color: 'from-gray-100 to-gray-50',
    count: 456,
  },
  {
    name: 'Текстиль',
    slug: 'tekstyl',
    description: 'Подушки, пледи, скатертини',
    icon: '🛋️',
    color: 'from-rose-100 to-rose-50',
    count: 780,
  },
  {
    name: 'Ролети',
    slug: 'rolety',
    description: 'Рулонні та римські',
    icon: '📐',
    color: 'from-green-100 to-green-50',
    count: 320,
  },
  {
    name: 'Аксесуари',
    slug: 'aksesuary',
    description: 'Підхвати, гачки, кільця',
    icon: '🎀',
    color: 'from-purple-100 to-purple-50',
    count: 540,
  },
]

export function CategorySection() {
  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="mb-3 text-2xl font-bold md:text-3xl">Категорії товарів</h2>
          <p className="text-secondary-600">
            Оберіть категорію, щоб знайти ідеальний товар для вашого інтер&apos;єру
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalog/${category.slug}`}
              className="group card overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className={`bg-gradient-to-br ${category.color} p-6`}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-4xl">{category.icon}</span>
                  <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-secondary-600">
                    {category.count} товарів
                  </span>
                </div>
                <h3 className="mb-1 text-lg font-semibold text-secondary-900 group-hover:text-primary-600">
                  {category.name}
                </h3>
                <p className="text-sm text-secondary-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
