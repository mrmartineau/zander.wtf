---
title: TanStack Table
link: https://tanstack.com/table/latest/docs/overview
tags:
  - react
  - typescript
emoji: 🗂
date: 2026-09-28
---

TanStack Table is a headless table library. It gives you the state and logic for sorting, filtering, pagination and row selection, and you write all of the markup and styles yourself. Use it when a table needs two or more of those features, or needs them to work against a server. If you only show a list of rows, a plain `<table>` and `.map()` is enough.

These notes are for v9. Most code online is v8 — see [v8 → v9](#v8--v9) below.

## Install

```sh
npm install @tanstack/react-table
```

v9 is ESM-only.

## Basic table

In v9 you declare the features a table uses with `tableFeatures()`. With no features you still get the core row model. The column helper takes the features type and your row type.

```tsx
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

type Person = {
  id: string
  name: string
  email: string
  age: number
}

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, Person>()

const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: (info) => <a href={`mailto:${info.getValue()}`}>{info.getValue()}</a>,
  }),
  columnHelper.accessor('age', { header: 'Age' }),
])

export function PeopleTable({ data }: { data: Array<Person> }) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
  })

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} colSpan={header.colSpan} scope="col">
                {header.isPlaceholder ? null : (
                  <table.FlexRender header={header} />
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getAllCells().map((cell) => (
              <td key={cell.id}>
                <table.FlexRender cell={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- `columnHelper.columns([...])` keeps each column's value type, so `info.getValue()` is typed.
- `<table.FlexRender header={header} />` and `<table.FlexRender cell={cell} />` render the `header` and `cell` column options. The old `flexRender(def, context)` function still works.
- `getRowId` gives rows a stable id. Without it the id is the row index, which breaks selection when data changes.

## Sorting, filtering and pagination

Each feature goes into `tableFeatures()` with its row model. Register only the sort and filter functions you use; string names like `'alphanumeric'` resolve only when they are registered. The table keeps its own state, so you read it from `table.state` and change it with methods such as `table.setGlobalFilter()` and `table.nextPage()`.

```tsx
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

// Person is the same type as in the basic table

const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
  filterFns: { includesString: filterFn_includesString },
})

const columnHelper = createColumnHelper<typeof features, Person>()

const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name', sortFn: 'alphanumeric' }),
  columnHelper.accessor('email', { header: 'Email', enableSorting: false }),
  columnHelper.accessor('age', { header: 'Age', sortFn: 'basic' }),
])

const ariaSort = {
  asc: 'ascending',
  desc: 'descending',
} as const

const arrows = { asc: ' ↑', desc: ' ↓' }

export function PeopleTable({ data }: { data: Array<Person> }) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    globalFilterFn: 'includesString',
    initialState: {
      pagination: { pageIndex: 0, pageSize: 20 },
    },
  })

  return (
    <>
      <input
        type="search"
        aria-label="Search people"
        placeholder="Search…"
        value={table.state.globalFilter ?? ''}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
      />

      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={sorted ? ariaSort[sorted] : undefined}
                  >
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        {sorted ? arrows[sorted] : null}
                      </button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getAllCells().map((cell) => (
                <td key={cell.id}>
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <nav aria-label="Pagination">
        <button
          type="button"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {table.state.pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          type="button"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
        <select
          aria-label="Rows per page"
          value={table.state.pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size} per page
            </option>
          ))}
        </select>
      </nav>
    </>
  )
}
```

Global filtering needs `columnFilteringFeature` as well as `globalFilteringFeature`. The page index goes back to 0 when the filter or sort changes.

Set starting values with `initialState`. If your own code must own a slice of state (for example, to put it in the URL), pass `state` and the matching `on[Slice]Change` handler, the same as v8.

## Row selection

Add `rowSelectionFeature` and a display column for the checkboxes. Render the table as in the basic example.

```tsx
import {
  createColumnHelper,
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

// Person is the same type as in the basic table

const features = tableFeatures({ rowSelectionFeature })

const columnHelper = createColumnHelper<typeof features, Person>()

const columns = columnHelper.columns([
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        aria-label="Select all rows"
        checked={table.getIsAllRowsSelected()}
        ref={(el) => {
          if (el) {
            el.indeterminate =
              table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
          }
        }}
        onChange={table.getToggleAllRowsSelectedHandler()}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        aria-label={`Select ${row.original.name}`}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
])

export function useSelectablePeopleTable(data: Array<Person>) {
  const table = useTable({
    features,
    columns,
    data,
    getRowId: (row) => row.id,
    enableRowSelection: (row) => row.original.age >= 18,
  })

  // { [rowId]: true }
  const selection = table.state.rowSelection
  const selectedPeople = table
    .getSelectedRowModel()
    .rows.map((row) => row.original)

  return { table, selection, selectedPeople }
}
```

- `rowSelection` state is an object of selected row ids, which is why `getRowId` matters.
- `row.getToggleSelectedHandler()` selects a range on Shift-click by default in v9. Set `enableRowRangeSelection: false` to stop that.
- In v9, `getIsSomeRowsSelected()` stays `true` when all rows are selected, so check `!getIsAllRowsSelected()` for the indeterminate state.

## Server-side sorting and pagination

When the server sorts and paginates, leave out the sorted and paginated row models and set `manualSorting` and `manualPagination`. Hold the state yourself, put it in the query key, and give the table the total with `rowCount` (or `pageCount`; use `-1` when the total is unknown). See [React Query](/notes/react-query/) for more on `useQuery`.

```tsx
import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  createColumnHelper,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { PaginationState, SortingState } from '@tanstack/react-table'

// Person is the same type as in the basic table

type PeoplePage = {
  rows: Array<Person>
  rowCount: number
}

declare function fetchPeople(params: {
  pageIndex: number
  pageSize: number
  sorting: SortingState
}): Promise<PeoplePage>

// No row models: the server sorts and paginates
const features = tableFeatures({ rowSortingFeature, rowPaginationFeature })

const columnHelper = createColumnHelper<typeof features, Person>()

const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: 'Name' }),
  columnHelper.accessor('email', { header: 'Email' }),
  columnHelper.accessor('age', { header: 'Age' }),
])

const emptyRows: Array<Person> = []

export function usePeopleTable() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const query = useQuery({
    queryKey: ['people', pagination, sorting],
    queryFn: () => fetchPeople({ ...pagination, sorting }),
    placeholderData: keepPreviousData,
  })

  const table = useTable({
    features,
    columns,
    data: query.data?.rows ?? emptyRows,
    rowCount: query.data?.rowCount,
    getRowId: (row) => row.id,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      setSorting(updater)
      // No sorted row model, so reset the page yourself
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    },
    onPaginationChange: setPagination,
    manualSorting: true,
    manualPagination: true,
  })

  return { table, query }
}
```

- `placeholderData: keepPreviousData` keeps the current page on screen while the next one loads, so the table does not flash empty. Use `query.isFetching` for a loading indicator.
- `emptyRows` is defined outside the component. `query.data?.rows ?? []` makes a new array on each render.
- Without the sorted or filtered row models, the table does not reset the page for you. Reset `pageIndex` in the change handler, as above.
- For a server-side search box, add `columnFilteringFeature`, `globalFilteringFeature` and `manualFiltering: true`, put `globalFilter` in the query key, and [debounce](/notes/debounce/) the input so each key press does not start a request.

## v8 → v9

- `useReactTable` is now `useTable`.
- The `features` option is required. Use `tableFeatures({ ... })`, or `stockFeatures` for all features as in v8 (bigger bundle).
- Row models move into `tableFeatures()`: `getSortedRowModel()` becomes `sortedRowModel: createSortedRowModel()`, and the same for filtered, paginated, expanded, grouped and faceted. `getCoreRowModel()` is gone; the core row model is always there.
- `filterFns`, `sortFns` and `aggregationFns` are registered on `tableFeatures()`. Prefer single imports such as `filterFn_includesString` and `sortFn_alphanumeric`.
- Sorting renames: `sortingFn` → `sortFn`, `sortingFns` → `sortFns`, `SortingFn` → `SortFn`.
- `table.getState()` is replaced by `table.state` (or `table.store.state`). `onStateChange` is removed; the per-slice `on[Slice]Change` handlers remain.
- Types take the features type first: `ColumnDef<typeof features, Person>`, `Row<typeof features, Person>`, `createColumnHelper<typeof features, Person>()`.
- `<table.FlexRender />` and `<FlexRender />` are new. `flexRender()` still works.
- Row, cell, column and header methods live on the prototype. Do not destructure them: use `row.getValue('name')`, not `const { getValue } = row`.
- Column pinning uses `start`/`end` instead of `left`/`right`, and `enablePinning` is split into `enableColumnPinning` and `enableRowPinning`.
- Column sizing and resizing are two features. `columnSizingInfo` state is now `columnResizing`.
- `table.Subscribe` and a selector (the second argument to `useTable`) let parts of the UI re-render only when their slice of state changes.
- `useLegacyTable` from `@tanstack/react-table/legacy` accepts v8-style options, to help you migrate in steps. It is deprecated.

## Gotchas

- **Keep `data` and `columns` stable.** Define columns outside the component, or use `useMemo` if they depend on props. Never pass `data={[]}` or `data={items.filter(...)}` inline: a new array on each render makes the table recompute, and with state updates this can cause an infinite render loop. Use a module-level empty array, `useState` or `useMemo`.
- **Use a real `<table>`.** Headless means the semantics are your job. Keep `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` and `<td>` so screen readers can move by row and column.
- **Put `aria-sort` on the `<th>`**, only on the sorted column, with `ascending` or `descending`.
- **Sort with a `<button>` in the header**, not an `onClick` on the `<th>` or a `<div>`. A button gets focus, Enter and Space for free.
- **Label the controls.** Checkboxes, the search input and the page-size select need an accessible name (`aria-label` or a `<label>`).

For thousands of rows, render only the rows on screen with [TanStack Virtual](https://tanstack.com/virtual/latest).
