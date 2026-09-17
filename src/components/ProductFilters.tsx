"use client"

export type FilterOption = {
  value: string
  count: number
}

type ProductFiltersProps = {
  collection: string
  tag: string
  collectionOptions: FilterOption[]
  tagOptions: FilterOption[]
  collectionsExpanded: boolean
  tagsExpanded: boolean
  onCollectionChange: (value: string) => void
  onTagChange: (value: string) => void
  onClearAll: () => void
  onToggleCollections: () => void
  onToggleTags: () => void
}

const INITIAL_OPTION_COUNT = 3

export default function ProductFilters({
  collection,
  tag,
  collectionOptions,
  tagOptions,
  collectionsExpanded,
  tagsExpanded,
  onCollectionChange,
  onTagChange,
  onClearAll,
  onToggleCollections,
  onToggleTags,
}: ProductFiltersProps) {
  return (
    <aside
      id="product-filters"
      className="rounded-lg border p-4 lg:sticky lg:top-6 lg:self-start"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold">Filters</h2>
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-medium underline"
        >
          Clear all
        </button>
      </div>

      <FilterGroup
        label="Collection"
        allLabel="All collections"
        selectedValue={collection}
        options={collectionOptions}
        expanded={collectionsExpanded}
        onChange={onCollectionChange}
        onToggleExpanded={onToggleCollections}
      />
      <FilterGroup
        label="Tag"
        allLabel="All tags"
        selectedValue={tag}
        options={tagOptions}
        expanded={tagsExpanded}
        onChange={onTagChange}
        onToggleExpanded={onToggleTags}
      />
    </aside>
  )
}

type FilterGroupProps = {
  label: string
  allLabel: string
  selectedValue: string
  options: FilterOption[]
  expanded: boolean
  onChange: (value: string) => void
  onToggleExpanded: () => void
}

function FilterGroup({
  label,
  allLabel,
  selectedValue,
  options,
  expanded,
  onChange,
  onToggleExpanded,
}: FilterGroupProps) {
  return (
    <fieldset className="mb-6 last:mb-0">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <label className="mb-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!selectedValue}
          onChange={() => onChange("")}
        />
        {allLabel}
      </label>
      {options.map((option, index) => (
        <label
          key={option.value}
          className={`${expanded || index < INITIAL_OPTION_COUNT ? "flex" : "hidden lg:flex"} mb-2 items-center gap-2 text-sm`}
        >
          <input
            type="checkbox"
            checked={selectedValue === option.value}
            onChange={() =>
              onChange(selectedValue === option.value ? "" : option.value)
            }
          />
          <span>{option.value}</span>
          <span className="text-xs text-gray-500">({option.count})</span>
        </label>
      ))}
      {options.length > INITIAL_OPTION_COUNT && (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="text-sm font-medium underline lg:hidden"
        >
          {expanded ? "Show less" : `Load more ${options.length - INITIAL_OPTION_COUNT}`}
        </button>
      )}
    </fieldset>
  )
}
