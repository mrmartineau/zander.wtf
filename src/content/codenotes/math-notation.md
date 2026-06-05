---
title: Basic Maths Notation
tags:
  - maths
  - reference
date: 2026-06-03
emoji: 🔢
---

A reference for reading the symbols in formulas, written for people (me) who aren't confident with maths. Most "scary" equations are just a recipe: do these operations, in this order, with these named ingredients.

## The symbols you'll meet most

| Symbol | Name | Means | Example |
|--------|------|-------|---------|
| `+ − × ÷` | plus, minus, times, divide | basic arithmetic | `3 × 4 = 12` |
| `=` | equals | left side has the same value as right | `Q = U × A` |
| `Σ` | sigma (capital) | **sum**: add up a series of things | see below |
| `Δ` | delta (capital) | **change/difference** between two values | `ΔT = 21 − (−3)` |
| `·` | dot | multiply (same as `×`) | `W/m²·K` |
| `²` `³` | superscript | a **power**: how many times to multiply by itself | `m² = m × m` |
| `√` | root | the opposite of a power | `√9 = 3` |
| `ⁿ` `ₓ` | super/subscript | a label or a power, depending on context | `x₁`, `2ⁿ` |
| `≈` | approximately equal | "about", not exact | `π ≈ 3.14` |
| `∝` | proportional to | grows in step with | `cost ∝ size` |

---

## Σ — "sum of"

The capital Greek letter sigma means **add all of these up**. It looks intimidating but it's just a loop.

`Σ (U × A × ΔT)`

reads as: *for each item, work out `U × A × ΔT`, then add all those results together.*

In code it's a `for` loop with a running total:

```js
// Σ (U × A × ΔT) for every wall/window/etc in a room
const total = surfaces.reduce(
  (sum, s) => sum + s.U * s.A * deltaT,
  0,
);
```

So a single `Σ` replaces "do this for the wall, the window, the roof, the floor… then add it all up".

---

## Δ — "the change in"

Capital delta means **difference**: end value minus start value.

`ΔT = inside − outside = 21 − (−3) = 24`

The two minus signs trip people up. Subtracting a negative is the same as adding:

```
21 − (−3)  =  21 + 3  =  24
```

`ΔT` is read "delta T" and almost always means a **temperature difference**.

---

## Powers and roots

A small raised number is a **power** — how many times to multiply a number by itself:

```
m²  = m × m          (square — think area)
m³  = m × m × m      (cube — think volume)
2⁵  = 2 × 2 × 2 × 2 × 2 = 32
```

A **root** is the reverse. `√9 = 3` because `3 × 3 = 9`.

You'll see powers most often in **units** (`m²` for area, `m³` for volume), not just in equations.

---

## Reading units: the `/` and `·`

Units carry meaning. Learn to read them aloud:

- `/` = "per". `m/s` = metres **per** second.
- `·` = multiply. `W/m²·K` = watts per (square-metre **times** kelvin).
- `K` = kelvin. For a *difference* in temperature, 1 K = 1 °C, so `ΔT` in K and in °C are the same number.

When a unit looks busy, it's usually telling you exactly what to multiply and divide:

> `U` has units `W/m²·K`. Multiply it by an area (`m²`) and a temperature difference (`K`) and the `m²` and `K` cancel out, leaving `W` — watts, a rate of heat loss. The units are a built-in sanity check.

---

## Worked example — heat loss from a room

Two formulas, both just "multiply the named things together". Numbers from a real heat-loss calc.

### 1. Fabric loss — heat through walls/windows/roof/floor

`Q_fabric = Σ (U × A × ΔT)`

- `U` = U-value (`W/m²·K`) — how leaky the material is. Triple glazing ≈ 0.8, solid brick ≈ 2.1. Higher = leakier.
- `A` = area (`m²`)
- `ΔT` = inside target − outside design temp, e.g. `21 − (−3) = 24 K`
- `Q_fabric` = the answer, in watts. (`Q` is the standard letter for "quantity of heat"; the small `fabric` is just a **label**, not maths.)

The `Σ` says: do `U × A × ΔT` for **each** surface, then add them.

```js
const surfaces = [
  { name: 'wall',   U: 2.1, A: 12 },
  { name: 'window', U: 0.8, A: 3  },
];
const deltaT = 21 - -3; // 24

const qFabric = surfaces.reduce(
  (sum, s) => sum + s.U * s.A * deltaT,
  0,
);
// wall:   2.1 × 12 × 24 = 604.8 W
// window: 0.8 × 3  × 24 =  57.6 W
// total = 662.4 W
```

### 2. Ventilation loss — heat carried out by air leaving the room

`Q_vent = 0.33 × ACH × V × ΔT`

- `0.33` = volumetric heat capacity of air (`Wh/m³·K`) — a fixed constant.
- `ACH` = air changes per hour (a lookup based on room type).
- `V` = room volume (`m³`)
- `ΔT` = same temperature difference as above.

No `Σ` here — it's a single multiplication, left to right:

```js
const qVent = 0.33 * ach * volume * deltaT;
// e.g. 0.33 × 1.5 × 30 × 24 = 356.4 W
```

Total heat the room loses = `Q_fabric + Q_vent`. That's the size of radiator you need.

---

## The trick for any formula

1. **Name every symbol.** A formula is a sentence — `Q`, `U`, `A` are just nouns with values.
2. **Subscripts are labels**, not maths. `Q_fabric` and `Q_vent` are two different `Q`s.
3. **`Σ` means loop-and-add.** Everything inside it happens once per item.
4. **Units tell you the operations.** If the answer should be watts and you've got watts, you did it right.
5. **Work left to right**, doing brackets `( )` first.

Once you can read it aloud in plain English, the maths is usually just multiplication.
