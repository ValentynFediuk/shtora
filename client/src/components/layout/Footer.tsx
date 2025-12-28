import Link from 'next/link'

const footerLinks = {
  catalog: [
    { name: 'Штори', href: '/catalog/shtory' },
    { name: 'Тюль', href: '/catalog/tiul' },
    { name: 'Карнизи', href: '/catalog/karnyzy' },
    { name: 'Текстиль', href: '/catalog/tekstyl' },
    { name: 'Акційні товари', href: '/sales' },
  ],
  info: [
    { name: 'Про нас', href: '/about' },
    { name: 'Доставка і оплата', href: '/delivery' },
    { name: 'Обмін і повернення', href: '/return' },
    { name: 'Контакти', href: '/contacts' },
    { name: 'Блог', href: '/blog' },
  ],
  help: [
    { name: 'Як замовити', href: '/how-to-order' },
    { name: 'Як обрати розмір', href: '/size-guide' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Відгуки', href: '/reviews' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo and contacts */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-primary-400">SHTORA</span>
            </Link>
            <p className="mt-4 max-w-xs text-secondary-400">
              Великий вибір штор, тюлів, карнизів та домашнього текстилю з доставкою по всій Україні
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-primary-400">📞</span>
                <div>
                  <a href="tel:0800123456" className="font-medium hover:text-primary-400">
                    0 800 123 456
                  </a>
                  <p className="text-xs text-secondary-500">безкоштовно по Україні</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary-400">✉️</span>
                <a href="mailto:info@shtora.ua" className="hover:text-primary-400">
                  info@shtora.ua
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-primary-400">📍</span>
                <span className="text-secondary-400">Київ, вул. Хрещатик, 1</span>
              </div>
            </div>
          </div>

          {/* Catalog links */}
          <div>
            <h3 className="mb-4 font-semibold">Каталог</h3>
            <ul className="space-y-2">
              {footerLinks.catalog.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h3 className="mb-4 font-semibold">Інформація</h3>
            <ul className="space-y-2">
              {footerLinks.info.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help links */}
          <div>
            <h3 className="mb-4 font-semibold">Допомога</h3>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-secondary-400 transition-colors hover:text-white"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment and delivery */}
        <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-secondary-800 pt-8">
          <div>
            <p className="mb-2 text-sm text-secondary-500">Оплата</p>
            <div className="flex gap-2">
              <span className="rounded bg-white px-2 py-1 text-xs font-medium text-secondary-900">
                Visa
              </span>
              <span className="rounded bg-white px-2 py-1 text-xs font-medium text-secondary-900">
                MasterCard
              </span>
              <span className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white">
                LiqPay
              </span>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-secondary-500">Доставка</p>
            <div className="flex gap-2">
              <span className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white">
                Нова Пошта
              </span>
              <span className="rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-secondary-900">
                Укрпошта
              </span>
            </div>
          </div>
        </div>

        {/* Social and copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-secondary-800 pt-8 md:flex-row">
          <div className="flex gap-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 transition-colors hover:text-white"
            >
              Facebook
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 transition-colors hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary-400 transition-colors hover:text-white"
            >
              Telegram
            </a>
          </div>
          <p className="text-sm text-secondary-500">
            © {new Date().getFullYear()} SHTORA. Всі права захищені.
          </p>
        </div>
      </div>
    </footer>
  )
}
