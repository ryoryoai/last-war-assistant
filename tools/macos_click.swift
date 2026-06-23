import ApplicationServices
import CoreGraphics
import Foundation

func fail(_ message: String) -> Never {
    FileHandle.standardError.write((message + "\n").data(using: .utf8)!)
    exit(2)
}

if CommandLine.arguments.contains("--check-accessibility") || CommandLine.arguments.contains("--prompt-accessibility") {
    let prompted = CommandLine.arguments.contains("--prompt-accessibility")
    let trusted: Bool
    if prompted {
        let key = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
        trusted = AXIsProcessTrustedWithOptions([key: true] as CFDictionary)
    } else {
        trusted = AXIsProcessTrusted()
    }
    let payload: [String: Any] = [
        "accessibility": trusted,
        "prompted_accessibility": prompted
    ]
    let data = try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
    FileHandle.standardOutput.write(data)
    FileHandle.standardOutput.write("\n".data(using: .utf8)!)
    exit(0)
}

guard CommandLine.arguments.count >= 3 else {
    fail("usage: macos_click <x> <y> [click_count]")
}

guard let x = Double(CommandLine.arguments[1]),
      let y = Double(CommandLine.arguments[2]) else {
    fail("x and y must be numbers")
}

let clickCount = CommandLine.arguments.count >= 4 ? (Int(CommandLine.arguments[3]) ?? 1) : 1
let point = CGPoint(x: x, y: y)

for _ in 0..<max(1, clickCount) {
    guard let down = CGEvent(mouseEventSource: nil, mouseType: .leftMouseDown, mouseCursorPosition: point, mouseButton: .left),
          let up = CGEvent(mouseEventSource: nil, mouseType: .leftMouseUp, mouseCursorPosition: point, mouseButton: .left) else {
        fail("failed to create mouse events")
    }

    down.post(tap: .cghidEventTap)
    usleep(60_000)
    up.post(tap: .cghidEventTap)
    usleep(120_000)
}
