"use client"

import { useState } from "react"
import ProductFilters, { type FilterOption } from "@/components/ProductFilters"
import { useProductsNavigation } from "@/hooks/useProductsNavigation"

export default function ProductFiltersPanel({
  collectionOptions,
  tagOptions,
}: {
  collectionOptions: FilterOption[]
  tagOptions: FilterOption[]
}) {
  const { query, toggleCollection, toggleTag, clearAll } = useProductsNavigation()
  const [collectionsExpanded, setCollectionsExpanded] = useState(false)
  const [tagsExpanded, setTagsExpanded] = useState(false)

  return (
    <ProductFilters
      collection={query.collection}
      tag={query.tag}
      collectionOptions={collectionOptions}
      tagOptions={tagOptions}
      collectionsExpanded={collectionsExpanded}
      tagsExpanded={tagsExpanded}
      onCollectionChange={toggleCollection}
      onTagChange={toggleTag}
      onClearAll={clearAll}
      onToggleCollections={() => setCollectionsExpanded((isExpanded) => !isExpanded)}
      onToggleTags={() => setTagsExpanded((isExpanded) => !isExpanded)}
    />
  )
}
