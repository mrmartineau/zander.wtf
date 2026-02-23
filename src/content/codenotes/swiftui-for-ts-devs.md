---
title: SwiftUI for TypeScript developers
tags:
  - swift
  - swiftui
  - typescript
  - cheatsheet
date: 2026-02-15
emoji: 🍎
---

A guide to SwiftUI for developers coming from TypeScript/JavaScript.

## Key differences from TypeScript

| Concept | TypeScript | Swift/SwiftUI |
|---------|-----------|---------------|
| Typing | Static, structural | Static, nominal + protocols |
| Execution | Interpreted (via JS) | Compiled to native binary |
| Memory | Garbage collected | ARC (Automatic Reference Counting) |
| Null | `null` / `undefined` | `Optional` (no null) |
| Errors | Exceptions | `throws` + `do/catch` |
| Package manager | npm/yarn/pnpm | Swift Package Manager (SPM) |
| UI framework | React/Vue/Svelte | SwiftUI (declarative, built-in) |

## Variables and constants

### TypeScript

```ts
const name: string = "Alice"
let age: number = 30
const isActive = true
```

### Swift

```swift
// Immutable (like const)
let name: String = "Alice"
let name = "Alice"  // Type inference

// Mutable (like let)
var age = 30
age = 31  // OK

// Type annotations
let score: Double = 9.5
let isActive: Bool = true

// Computed properties (like getters)
var greeting: String {
    "Hello, \(name)!"
}
```

## Basic types

| TypeScript | Swift |
|-----------|-------|
| `string` | `String` |
| `number` | `Int`, `Double`, `Float`, `CGFloat` |
| `boolean` | `Bool` |
| `any` | `Any` (use sparingly) |
| `null` / `undefined` | `nil` (with Optionals) |
| `Array<T>` | `[T]` or `Array<T>` |
| `Record<string, V>` | `[String: V]` or `Dictionary<String, V>` |
| `Set<T>` | `Set<T>` |
| `[T, U]` | `(T, U)` tuple |

### Numeric types

```swift
// Integers
let a: Int = 42          // Platform-sized (64-bit on modern)
let b: Int8 = 127
let c: Int16 = 32_767
let d: Int64 = 9_223_372_036_854_775_807
let e: UInt = 42          // Unsigned

// Floating point
let f: Float = 3.14       // 32-bit
let g: Double = 3.141592653589793  // 64-bit (default)
let h: CGFloat = 10.0     // Used in UI layout

// Underscores for readability
let million = 1_000_000
```

### Strings

```swift
// String basics
let s = "hello"
var mutable = "hello"
mutable += ", world!"

// String interpolation (like template literals)
let name = "Alice"
let greeting = "Hello, \(name)!"
let math = "2 + 2 = \(2 + 2)"

// Multi-line strings (like template literals)
let text = """
    This is a
    multi-line string
    """

// Common operations
let upper = s.uppercased()
let contains = s.contains("ell")
let count = s.count
let isEmpty = s.isEmpty
```

## Functions

### TypeScript

```ts
function greet(name: string): string {
    return `Hello, ${name}!`
}

const add = (a: number, b: number): number => a + b

function log(message: string, level: string = "INFO"): void {
    console.log(`[${level}] ${message}`)
}
```

### Swift

```swift
// Basic function
func greet(name: String) -> String {
    "Hello, \(name)!"  // Implicit return for single expressions
}

// Argument labels (external + internal names)
func greet(person name: String) -> String {
    "Hello, \(name)!"
}
greet(person: "Alice")

// Omit external label with _
func add(_ a: Int, _ b: Int) -> Int {
    a + b
}
add(1, 2)  // No labels needed

// Default parameters
func log(_ message: String, level: String = "INFO") {
    print("[\(level)] \(message)")
}
log("Hello")
log("Hello", level: "DEBUG")

// Closures (like arrow functions)
let add = { (a: Int, b: Int) -> Int in
    a + b
}

// Shorthand closure syntax
let doubled = [1, 2, 3].map { $0 * 2 }
let sum = [1, 2, 3].reduce(0) { $0 + $1 }
// Or even shorter with operator
let sum = [1, 2, 3].reduce(0, +)

// Trailing closure syntax
let evens = [1, 2, 3, 4].filter { $0 % 2 == 0 }
```

## Optionals (null safety)

**This is a key concept in Swift.** There's no `null` or `undefined` - instead, Swift uses Optionals.

### TypeScript

```ts
function find(id: number): User | undefined {
    return users.find(u => u.id === id)
}

const user = find(1)
if (user) {
    console.log(user.name)
}
console.log(user?.name ?? "Unknown")
```

### Swift

```swift
// Optional type (can be nil)
var name: String? = "Alice"
var missing: String? = nil

// Unwrapping optionals
// 1. if let (like if (value) in TS)
if let name = name {
    print("Name: \(name)")
}

// 2. guard let (early return)
func greet(_ name: String?) -> String {
    guard let name = name else {
        return "Hello, stranger!"
    }
    return "Hello, \(name)!"
}

// 3. Optional chaining (like ?.)
let count = name?.count  // Int?

// 4. Nil coalescing (like ??)
let displayName = name ?? "Unknown"

// 5. Force unwrap (like ! in TS - avoid!)
let forced = name!  // Crashes if nil!

// 6. map / flatMap on optionals
let uppercased = name.map { $0.uppercased() }  // String?

// Optional binding with multiple values
if let name = name, let age = age, age > 18 {
    print("\(name) is an adult")
}
```

## Structs and classes

### TypeScript

```ts
interface User {
    id: number
    name: string
    email?: string
}

class UserService {
    private users: User[] = []

    addUser(user: User): void {
        this.users.push(user)
    }
}
```

### Swift

```swift
// Struct (value type - preferred in SwiftUI)
struct User {
    let id: Int
    var name: String
    var email: String?

    // Computed property
    var displayName: String {
        email.map { "\(name) (\($0))" } ?? name
    }

    // Method
    func greet() -> String {
        "Hello, \(name)!"
    }

    // Mutating method (modifies struct)
    mutating func updateName(_ newName: String) {
        name = newName
    }
}

// Memberwise initializer (auto-generated)
let user = User(id: 1, name: "Alice", email: nil)

// Custom initializer
struct User {
    let id: Int
    var name: String

    init(id: Int, name: String) {
        self.id = id
        self.name = name
    }
}

// Class (reference type - use for shared state)
class UserService {
    private var users: [User] = []

    func addUser(_ user: User) {
        users.append(user)
    }
}
```

### Struct vs class

```swift
// Struct = value type (copied on assignment)
var a = User(id: 1, name: "Alice", email: nil)
var b = a
b.name = "Bob"
print(a.name)  // "Alice" (unchanged)

// Class = reference type (shared on assignment)
let service1 = UserService()
let service2 = service1
service2.addUser(user)
// service1 and service2 point to same instance
```

## Enums

### TypeScript

```ts
type Status = "pending" | "active" | "inactive"

type Result<T, E> =
    | { ok: true; value: T }
    | { ok: false; error: E }
```

### Swift

```swift
// Simple enum
enum Status {
    case pending
    case active
    case inactive
}

let status = Status.active
// Or shorthand when type is known
let status: Status = .active

// Enum with associated values (like discriminated unions)
enum Message {
    case quit
    case move(x: Int, y: Int)
    case write(String)
    case changeColor(r: UInt8, g: UInt8, b: UInt8)
}

let msg = Message.move(x: 10, y: 20)
let msg = Message.write("hello")

// Pattern matching (like switch but exhaustive)
switch msg {
case .quit:
    print("Quit")
case .move(let x, let y):
    print("Move to \(x), \(y)")
case .write(let text):
    print("Text: \(text)")
case .changeColor(let r, let g, let b):
    print("Color: \(r), \(g), \(b)")
}

// Enum with raw values
enum Direction: String {
    case north = "N"
    case south = "S"
    case east = "E"
    case west = "W"
}

let dir = Direction.north
print(dir.rawValue)  // "N"
let dir = Direction(rawValue: "N")  // Optional<Direction>

// Enum with methods
enum Temperature {
    case celsius(Double)
    case fahrenheit(Double)

    var asCelsius: Double {
        switch self {
        case .celsius(let c): return c
        case .fahrenheit(let f): return (f - 32) * 5 / 9
        }
    }
}
```

### Result type (built-in)

```swift
// Result<Success, Failure> - like TS Result type
enum NetworkError: Error {
    case notFound
    case serverError(Int)
}

func fetchUser(id: Int) -> Result<User, NetworkError> {
    if id <= 0 {
        return .failure(.notFound)
    }
    return .success(User(id: id, name: "Alice", email: nil))
}

// Handling Result
switch fetchUser(id: 1) {
case .success(let user):
    print("Got user: \(user.name)")
case .failure(let error):
    print("Error: \(error)")
}

// Or with get()
let user = try? fetchUser(id: 1).get()  // Optional<User>
```

## Protocols (interfaces)

### TypeScript

```ts
interface Drawable {
    draw(): void
}

interface Resizable {
    resize(width: number, height: number): void
}

class Circle implements Drawable, Resizable {
    draw() { /* ... */ }
    resize(w: number, h: number) { /* ... */ }
}
```

### Swift

```swift
protocol Drawable {
    func draw()
}

protocol Resizable {
    mutating func resize(width: Double, height: Double)
}

struct Circle: Drawable, Resizable {
    var radius: Double

    func draw() {
        print("Drawing circle with radius \(radius)")
    }

    mutating func resize(width: Double, height: Double) {
        radius = min(width, height) / 2
    }
}

// Protocol with default implementation
protocol Greetable {
    var name: String { get }

    func greet() -> String
}

extension Greetable {
    func greet() -> String {
        "Hello, \(name)!"
    }
}

// Protocol constraints (like generic constraints)
func render<T: Drawable>(_ item: T) {
    item.draw()
}

// Multiple constraints
func process<T: Drawable & Resizable>(_ item: inout T) {
    item.draw()
    item.resize(width: 100, height: 100)
}

// some keyword (opaque type)
func makeShape() -> some Drawable {
    Circle(radius: 5)
}

// any keyword (existential type)
func renderAll(_ items: [any Drawable]) {
    for item in items {
        item.draw()
    }
}
```

### Common protocols

```swift
// Codable - JSON encoding/decoding (like serde)
struct User: Codable {
    let id: Int
    let name: String
}

// Equatable - equality comparison
struct Point: Equatable {
    let x: Double
    let y: Double
}

// Hashable - can be used in Sets and Dictionary keys
struct Id: Hashable {
    let value: Int
}

// Identifiable - common in SwiftUI lists
struct Item: Identifiable {
    let id: UUID
    let title: String
}

// CustomStringConvertible - toString()
struct User: CustomStringConvertible {
    let name: String
    var description: String { "User(\(name))" }
}
```

## Collections

### TypeScript

```ts
const arr: number[] = [1, 2, 3]
arr.push(4)
const doubled = arr.map(n => n * 2)
const evens = arr.filter(n => n % 2 === 0)
const sum = arr.reduce((a, b) => a + b, 0)
```

### Swift

```swift
// Array
var arr = [1, 2, 3]
arr.append(4)

// Functional operations (eager, not lazy by default)
let doubled = arr.map { $0 * 2 }
let evens = arr.filter { $0 % 2 == 0 }
let sum = arr.reduce(0, +)

// Or with trailing closure
let sum = arr.reduce(0) { $0 + $1 }

// Iteration
for n in arr {
    print(n)
}

for (i, n) in arr.enumerated() {
    print("\(i): \(n)")
}

// Common methods
arr.count
arr.isEmpty
arr.contains(2)
arr.first           // Optional
arr.last            // Optional
arr.firstIndex(of: 2)
arr.sorted()
arr.reversed()
arr.compactMap { Int($0) }  // Filter nil values
arr.flatMap { [$0, $0] }
arr.prefix(2)       // First 2
arr.suffix(2)       // Last 2
arr.dropFirst()
arr.dropLast()

// Lazy evaluation (like Rust iterators)
let result = arr.lazy
    .filter { $0 % 2 == 0 }
    .map { $0 * 2 }
    .prefix(5)
```

### Dictionary

```swift
var scores: [String: Int] = [:]
scores["Alice"] = 100
scores["Bob"] = 85

// Literal
let scores = [
    "Alice": 100,
    "Bob": 85,
]

// Access (returns Optional)
let aliceScore = scores["Alice"]  // Int?
let aliceScore = scores["Alice", default: 0]  // Int

// Update
scores["Alice"] = 110
scores.updateValue(110, forKey: "Alice")

// Check and set
if scores["Charlie"] == nil {
    scores["Charlie"] = 0
}

// Iterate
for (name, score) in scores {
    print("\(name): \(score)")
}

// Transform
let doubled = scores.mapValues { $0 * 2 }

// Remove
scores.removeValue(forKey: "Bob")
```

## Error handling

### TypeScript

```ts
try {
    const data = await fetchData()
} catch (error) {
    console.error("Failed:", error)
    throw error
}
```

### Swift

```swift
// Define errors
enum AppError: Error {
    case notFound
    case invalidInput(String)
    case networkError(underlying: Error)
}

// Throwing functions
func fetchUser(id: Int) throws -> User {
    guard id > 0 else {
        throw AppError.invalidInput("ID must be positive")
    }
    // ...
    return User(id: id, name: "Alice", email: nil)
}

// Handling errors with do/catch
do {
    let user = try fetchUser(id: 1)
    print(user.name)
} catch AppError.notFound {
    print("User not found")
} catch AppError.invalidInput(let message) {
    print("Invalid: \(message)")
} catch {
    print("Error: \(error)")  // Implicit `error` binding
}

// try? - convert to optional (like catch returning undefined)
let user = try? fetchUser(id: 1)  // User?

// try! - force (crashes on error, avoid!)
let user = try! fetchUser(id: 1)

// Propagate errors (like ? in Rust)
func loadProfile(id: Int) throws -> Profile {
    let user = try fetchUser(id: id)  // Propagates error
    return try fetchProfile(for: user)
}

// Error with LocalizedError for descriptions
enum AppError: LocalizedError {
    case notFound

    var errorDescription: String? {
        switch self {
        case .notFound: return "The requested item was not found"
        }
    }
}
```

## SwiftUI basics

### React/TypeScript equivalent

```tsx
function Counter() {
    const [count, setCount] = useState(0)

    return (
        <div style={{ padding: 20 }}>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>
                Increment
            </button>
        </div>
    )
}
```

### SwiftUI

```swift
struct CounterView: View {
    @State private var count = 0

    var body: some View {
        VStack(spacing: 20) {
            Text("Count: \(count)")
            Button("Increment") {
                count += 1
            }
        }
        .padding()
    }
}
```

## SwiftUI state management

### React state vs SwiftUI property wrappers

| React | SwiftUI | Use case |
|-------|---------|----------|
| `useState` | `@State` | Local component state |
| `useRef` | Regular property | Non-reactive value |
| `props` | Regular `let`/`var` | Passed from parent |
| `useState` + callback | `@Binding` | Two-way parent-child binding |
| `useContext` | `@Environment` | App-wide values |
| `useContext` + reducer | `@Observable` | Shared mutable state |
| `useMemo` | Computed property | Derived values |

### @State (local state)

```swift
struct ToggleView: View {
    @State private var isOn = false

    var body: some View {
        Toggle("Switch", isOn: $isOn)  // $ creates a Binding
        Text(isOn ? "ON" : "OFF")
    }
}
```

### @Binding (two-way props)

```swift
// Like passing setState down as a prop
struct ParentView: View {
    @State private var name = ""

    var body: some View {
        ChildView(name: $name)  // Pass binding
        Text("Hello, \(name)")
    }
}

struct ChildView: View {
    @Binding var name: String

    var body: some View {
        TextField("Enter name", text: $name)
    }
}
```

### @Observable (shared state)

```swift
import Observation

// Like a context + reducer
@Observable
class AppState {
    var user: User?
    var isLoading = false
    var items: [Item] = []

    func loadItems() async {
        isLoading = true
        items = await api.fetchItems()
        isLoading = false
    }
}

struct ContentView: View {
    var state = AppState()

    var body: some View {
        if state.isLoading {
            ProgressView()
        } else {
            List(state.items) { item in
                Text(item.title)
            }
        }
    }
}
```

### @Environment (dependency injection)

```swift
// Like React Context
struct ContentView: View {
    @Environment(\.colorScheme) var colorScheme
    @Environment(\.dismiss) var dismiss

    var body: some View {
        Text("Mode: \(colorScheme == .dark ? "Dark" : "Light")")
        Button("Close") { dismiss() }
    }
}
```

## SwiftUI views and layout

### React JSX vs SwiftUI

```swift
// VStack = flexbox column
VStack(alignment: .leading, spacing: 10) {
    Text("Title")
        .font(.title)
    Text("Subtitle")
        .foregroundStyle(.secondary)
}

// HStack = flexbox row
HStack(spacing: 12) {
    Image(systemName: "star.fill")
    Text("Favorites")
    Spacer()  // Like flex-grow
    Text("42")
}

// ZStack = position absolute / z-index
ZStack {
    Color.blue  // Background
    Text("Overlay")
        .foregroundStyle(.white)
}

// ScrollView
ScrollView {
    VStack {
        ForEach(items) { item in
            Text(item.title)
        }
    }
}

// List (like a styled ul with built-in features)
List(items) { item in
    HStack {
        Text(item.title)
        Spacer()
        Text(item.detail)
            .foregroundStyle(.secondary)
    }
}
```

### View modifiers (like CSS/styled-components)

```swift
Text("Hello")
    .font(.title)                    // font-size
    .fontWeight(.bold)               // font-weight
    .foregroundStyle(.blue)          // color
    .padding()                       // padding (all sides)
    .padding(.horizontal, 20)       // padding-left/right
    .background(.gray.opacity(0.2)) // background-color
    .clipShape(RoundedRectangle(cornerRadius: 12))  // border-radius
    .shadow(radius: 4)              // box-shadow
    .frame(width: 200, height: 50)  // width/height
    .frame(maxWidth: .infinity)     // width: 100%
    .opacity(0.5)                   // opacity
```

### Conditional rendering

```swift
// Like {condition && <Component />}
if isLoggedIn {
    ProfileView()
} else {
    LoginView()
}

// Ternary in modifiers
Text("Status")
    .foregroundStyle(isActive ? .green : .red)

// Like {items.map(item => <Item key={item.id} />)}
ForEach(items) { item in
    ItemRow(item: item)
}

// Optional content
if let user = currentUser {
    Text("Hello, \(user.name)")
}
```

## Navigation

### React Router vs SwiftUI Navigation

```swift
// NavigationStack (like React Router)
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List(items) { item in
                NavigationLink(value: item) {
                    Text(item.title)
                }
            }
            .navigationTitle("Items")
            .navigationDestination(for: Item.self) { item in
                ItemDetailView(item: item)
            }
        }
    }
}

// TabView (like bottom tab navigation)
struct MainView: View {
    var body: some View {
        TabView {
            Tab("Home", systemImage: "house") {
                HomeView()
            }
            Tab("Search", systemImage: "magnifyingglass") {
                SearchView()
            }
            Tab("Profile", systemImage: "person") {
                ProfileView()
            }
        }
    }
}

// Sheet (modal)
struct ContentView: View {
    @State private var showSheet = false

    var body: some View {
        Button("Show Modal") {
            showSheet = true
        }
        .sheet(isPresented: $showSheet) {
            ModalView()
        }
    }
}
```

## Async/Await

### TypeScript

```ts
async function fetchData(url: string): Promise<Response> {
    const response = await fetch(url)
    return response
}

const results = await Promise.all([
    fetchData("url1"),
    fetchData("url2")
])
```

### Swift

```swift
// Async function
func fetchData(url: String) async throws -> Data {
    let (data, _) = try await URLSession.shared.data(from: URL(string: url)!)
    return data
}

// Call from SwiftUI
struct ContentView: View {
    @State private var items: [Item] = []

    var body: some View {
        List(items) { item in
            Text(item.title)
        }
        .task {  // Like useEffect(() => {}, [])
            do {
                items = try await fetchItems()
            } catch {
                print("Error: \(error)")
            }
        }
    }
}

// Concurrent execution (like Promise.all)
async let result1 = fetchData(url: "url1")
async let result2 = fetchData(url: "url2")
let (data1, data2) = try await (result1, result2)

// TaskGroup (like Promise.all with dynamic array)
let results = try await withThrowingTaskGroup(of: Data.self) { group in
    for url in urls {
        group.addTask {
            try await fetchData(url: url)
        }
    }

    var collected: [Data] = []
    for try await result in group {
        collected.append(result)
    }
    return collected
}
```

## JSON handling (Codable)

### TypeScript

```ts
interface User {
    id: number
    name: string
}
const json = JSON.stringify(user)
const parsed: User = JSON.parse(json)
```

### Swift

```swift
// Codable = Encodable + Decodable (like serde)
struct User: Codable {
    let id: Int
    let name: String
    let email: String?

    // Custom key mapping (like serde rename)
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case email
        case createdAt = "created_at"
    }
}

// Encode (stringify)
let user = User(id: 1, name: "Alice", email: nil)
let encoder = JSONEncoder()
encoder.outputFormatting = .prettyPrinted
let json = try encoder.encode(user)
let jsonString = String(data: json, encoding: .utf8)!

// Decode (parse)
let decoder = JSONDecoder()
let user = try decoder.decode(User.self, from: jsonData)

// Decode array
let users = try decoder.decode([User].self, from: jsonData)

// Date handling
let decoder = JSONDecoder()
decoder.dateDecodingStrategy = .iso8601
```

## Generics

### TypeScript

```ts
function first<T>(arr: T[]): T | undefined {
    return arr[0]
}

interface Container<T> {
    value: T
    map<U>(fn: (v: T) => U): Container<U>
}
```

### Swift

```swift
// Generic function
func first<T>(_ array: [T]) -> T? {
    array.first
}

// Generic struct
struct Container<T> {
    let value: T

    func map<U>(_ transform: (T) -> U) -> Container<U> {
        Container<U>(value: transform(value))
    }
}

// Usage
let c = Container(value: 42)
let doubled = c.map { $0 * 2 }

// Constrained generics
func printDebug<T: CustomStringConvertible>(_ value: T) {
    print(value.description)
}

// Multiple constraints
func process<T: Codable & Equatable>(_ value: T) { }

// where clause
func combine<T, U>(_ a: T, _ b: U) -> String
where T: CustomStringConvertible, U: CustomStringConvertible {
    "\(a) \(b)"
}
```

## Common SwiftUI patterns

### Extracting subviews (like React components)

```swift
// Extract reusable views
struct BadgeView: View {
    let text: String
    let color: Color

    var body: some View {
        Text(text)
            .font(.caption)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(color.opacity(0.2))
            .foregroundStyle(color)
            .clipShape(Capsule())
    }
}

// Usage
BadgeView(text: "New", color: .blue)
```

### View composition with ViewBuilder

```swift
// Like React children prop
struct Card<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title).font(.headline)
            content
        }
        .padding()
        .background(.background)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(radius: 2)
    }
}

// Usage
Card(title: "Profile") {
    Text("Alice")
    Text("alice@example.com")
        .foregroundStyle(.secondary)
}
```

### Custom modifiers (like styled-components)

```swift
struct CardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(.background)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .shadow(radius: 2)
    }
}

extension View {
    func cardStyle() -> some View {
        modifier(CardModifier())
    }
}

// Usage
Text("Hello")
    .cardStyle()
```

## Testing

### TypeScript (Jest)

```ts
describe('math', () => {
    it('adds numbers', () => {
        expect(add(1, 2)).toBe(3)
    })
})
```

### Swift

```swift
import XCTest
@testable import MyApp

class MathTests: XCTestCase {
    func testAdd() {
        XCTAssertEqual(add(1, 2), 3)
    }

    func testAddNegative() {
        XCTAssertEqual(add(-1, 1), 0)
    }

    func testDivideByZero() {
        XCTAssertThrowsError(try divide(1, 0)) { error in
            XCTAssertEqual(error as? MathError, .divideByZero)
        }
    }

    // Async test
    func testFetchUser() async throws {
        let user = try await fetchUser(id: 1)
        XCTAssertEqual(user.name, "Alice")
    }
}
```

## Common gotchas for TS developers

1. **Value vs reference types** - structs are copied, classes are shared
2. **Optionals everywhere** - must unwrap before use, no implicit coercion
3. **`$` prefix** - creates a `Binding` for two-way data flow
4. **View is a struct** - views are value types, recreated on state change
5. **`some View`** - opaque return type, must return a single view type
6. **Argument labels** - function calls use labels: `greet(person: "Alice")`
7. **`self` is explicit** - required in closures and initializers
8. **No spread operator** - no `...` equivalent for structs
9. **Protocol-oriented** - prefer protocols over inheritance
10. **@State is private** - local state, use @Binding to share with children

```swift
// Returning multiple view types requires Group or AnyView
var body: some View {
    // ERROR: different return types
    // if condition { Text("A") } else { Image("B") }

    // OK: Group wraps different types
    Group {
        if condition {
            Text("A")
        } else {
            Image("B")
        }
    }
}
```

## Resources

- [Swift Language Guide](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/)
- [SwiftUI Tutorials (Apple)](https://developer.apple.com/tutorials/swiftui)
- [Hacking with Swift](https://www.hackingwithswift.com/)
- [Swift Playground](https://www.swift.org/blog/online-swift-playground/)
- [Swift Package Index](https://swiftpackageindex.com/)
- [SwiftUI by Example](https://www.hackingwithswift.com/quick-start/swiftui)
