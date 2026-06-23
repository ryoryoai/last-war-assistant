import CoreGraphics
import Foundation

guard let event = CGEvent(source: nil) else {
    FileHandle.standardError.write("failed to read pointer position\n".data(using: .utf8)!)
    exit(2)
}

let point = event.location
print("\(Int(point.x.rounded())) \(Int(point.y.rounded()))")
