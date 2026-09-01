import Foundation
import PDFKit
import AppKit

let pdfUrl = URL(fileURLWithPath: "public/mrt-map.pdf")
let outputUrl = URL(fileURLWithPath: "public/mrt-map.png")

guard let doc = PDFDocument(url: pdfUrl), let page = doc.page(at: 0) else {
    print("Error loading PDF")
    exit(1)
}

let mediaBox = page.bounds(for: .mediaBox)
let targetDimension: CGFloat = 3600.0 // 3600x3600 ultra HD
let scale = targetDimension / mediaBox.width
let targetSize = CGSize(width: targetDimension, height: targetDimension)

let colorSpace = CGColorSpaceCreateDeviceRGB()
guard let context = CGContext(
    data: nil,
    width: Int(targetDimension),
    height: Int(targetDimension),
    bitsPerComponent: 8,
    bytesPerRow: 0,
    space: colorSpace,
    bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
) else {
    print("Error creating CGContext")
    exit(1)
}

// Fill white background
context.setFillColor(CGColor(red: 1, green: 1, blue: 1, alpha: 1))
context.fill(CGRect(origin: .zero, size: targetSize))

// High-quality rendering settings
context.interpolationQuality = .high
context.setAllowsAntialiasing(true)
context.setShouldAntialias(true)

// Scale and render PDF page
context.saveGState()
context.scaleBy(x: scale, y: scale)
page.draw(with: .mediaBox, to: context)
context.restoreGState()

guard let cgImage = context.makeImage() else {
    print("Error making CGImage")
    exit(1)
}

let bitmapRep = NSBitmapImageRep(cgImage: cgImage)
bitmapRep.size = NSSize(width: targetDimension, height: targetDimension)

guard let pngData = bitmapRep.representation(using: .png, properties: [:]) else {
    print("Error encoding PNG")
    exit(1)
}

try pngData.write(to: outputUrl)
print("Successfully generated ultra-HD MRT map at \(Int(targetDimension))x\(Int(targetDimension)) (size: \(pngData.count / 1024) KB)")
