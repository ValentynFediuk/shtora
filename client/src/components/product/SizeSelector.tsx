'use client'

interface VariantItem {
  width: number
  height: number
  price: number
  oldPrice?: number
  inStock?: boolean
}

interface SizeSelectorProps {
  variants: VariantItem[]
  selected?: VariantItem
  onSelect: (v: VariantItem) => void
}

export function SizeSelector({ variants, selected, onSelect }: SizeSelectorProps) {
  const items = [...variants]
    .filter(v => typeof v.width === 'number' && typeof v.height === 'number' && typeof v.price === 'number')
    .sort((a, b) => a.width - b.width || a.height - b.height)

  if (items.length === 0) return null

  const formatPrice = (price: number) => price.toLocaleString('uk-UA')

  return (
    <div className="mb-6">
      <label className="mb-3 block text-sm font-bold text-secondary-900">
        Оберіть розмір (ширина × висота, см)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((v, idx) => {
          const isSelected = selected && v.width === selected.width && v.height === selected.height
          const sizeLabel = `${v.width}×${v.height}`

          return (
            <button
              key={`size-${v.width}-${v.height}-${idx}`}
              type="button"
              onClick={() => onSelect(v)}
              className={
                `rounded-lg px-3 py-2.5 text-center transition-all border ` +
                (isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : (v.inStock === false
                      ? 'border-secondary-200 bg-secondary-50 text-secondary-400 opacity-60 cursor-not-allowed'
                      : 'border-secondary-200 bg-white text-secondary-700 hover:border-primary-400 hover:bg-primary-50'))
              }
              disabled={v.inStock === false}
            >
              <div className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : ''}`}>
                {sizeLabel}
              </div>
              <div className={`text-xs mt-0.5 ${isSelected ? 'text-primary-700 font-bold' : 'text-secondary-500 font-semibold'}`}>
                {formatPrice(v.price)} ₴
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-2 text-xs text-secondary-500">
        Натисніть на потрібний розмір, щоб оновити ціну і додати в кошик
      </p>
    </div>
  )
}
