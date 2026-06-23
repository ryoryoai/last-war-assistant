import ApplicationServices
import CoreGraphics
import Foundation

let promptAccessibility = CommandLine.arguments.contains("--prompt-accessibility")
let promptScreenCapture = CommandLine.arguments.contains("--prompt-screen-capture")

let accessibilityTrusted: Bool
if promptAccessibility {
    let key = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
    accessibilityTrusted = AXIsProcessTrustedWithOptions([key: true] as CFDictionary)
} else {
    accessibilityTrusted = AXIsProcessTrusted()
}

let screenCaptureAllowed: Bool
if #available(macOS 10.15, *) {
    if promptScreenCapture {
        screenCaptureAllowed = CGRequestScreenCaptureAccess()
    } else {
        screenCaptureAllowed = CGPreflightScreenCaptureAccess()
    }
} else {
    screenCaptureAllowed = true
}

let payload: [String: Any] = [
    "accessibility": accessibilityTrusted,
    "screen_capture": screenCaptureAllowed,
    "prompted_accessibility": promptAccessibility,
    "prompted_screen_capture": promptScreenCapture
]

let data = try JSONSerialization.data(withJSONObject: payload, options: [.prettyPrinted, .sortedKeys])
FileHandle.standardOutput.write(data)
FileHandle.standardOutput.write("\n".data(using: .utf8)!)
