import "./styles/app.scss"

import { Font as OTFont } from "opentype.js"
import { Viewport } from "./viewport/viewport"
import { BezierPenTool } from "./viewport/tools/bezierPen"
import { HandleTool } from "./viewport/tools/handle"
import { Glyph } from "./font/glyph"
import { GlyphContext } from "./viewport/context/glyph"
import { Font } from "./font/font"
import { exportFont } from "./io/export"
import { canRedo, canUndo, redo, undo } from "./undo/history"
import { updateSubactions } from "./ui/toolbar"
import { prepareGlyphList } from "./ui/glyphList"

const basicCharacterSet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890.,!? "

export default (font: OTFont) => {
    const container = document.querySelector("div.viewport")
    const glyphsTextbox = document.querySelector("input.viewportText") as HTMLInputElement

    const subactionContainer = document.querySelector("div.subactions")

    const fteFont = Font.fromOTFont(font)

    const glyphs = basicCharacterSet.split("").map(
        chr => Glyph.fromOTGlyph(fteFont, font, font.charToGlyph(chr))
    )
    fteFont.addGlyph(...glyphs)
    console.log(font)

    const context = new GlyphContext(
        "ABC".split("").map(
            chr => glyphs.find(g => g.codePoint === chr.codePointAt(0))
        ), 0
    )
    const viewport = new Viewport(
        context, [], null
    )
    container.appendChild(viewport.domCanvas)
    viewport.updateViewportSize()

    viewport.setTool(new HandleTool())
    updateSubactions(viewport, [viewport.tool.subactions])
    
    prepareGlyphList(fteFont)

    exportFont(fteFont, "build/test/exported.otf")

    glyphsTextbox.addEventListener("input", () => updateViewport())
    document.querySelector("button.prevGlyph").addEventListener(
        "click", () => {
            context.setGlyphs(
                null, context.currentIndex === 0 ?
                      context.glyphs.length - 1 :
                      context.currentIndex - 1
            )
            viewport.tool.updateContext(context)
            viewport.render()
        }
    )
    document.querySelector("button.nextGlyph").addEventListener(
        "click", () => {
            context.setGlyphs(
                null, context.currentIndex === context.glyphs.length - 1 ?
                      0 :
                      context.currentIndex + 1
            )
            viewport.tool.updateContext(context)
            viewport.render()
        }
    )

    function updateViewport() {
        const text = glyphsTextbox.value
        if (!text.length) return

        const textGlyphs = text.split("").map(
            chr => glyphs.find(g => g.codePoint === chr.codePointAt(0))
        ).filter(g => g)

        context.setGlyphs(textGlyphs)
        viewport.tool.updateContext(context)
        viewport.render()
    }

    document.querySelector("button[data-tool=handle]").addEventListener(
        "click", () => {
            viewport.setTool(new HandleTool())
            updateSubactions(viewport, [viewport.tool.subactions])
        }
    )
    document.querySelector("button[data-tool=pen]").addEventListener(
        "click", () => {
            viewport.setTool(new BezierPenTool())
            updateSubactions(viewport, [viewport.tool.subactions])
        }
    )

    window.addEventListener("resize", () => {
        viewport.updateViewportSize()
    })

    const g = window as any

    g.undo = () => {
        if (!canUndo()) return false

        undo()
        viewport.render()
        return true
    }
    g.redo = () => {
        if (!canRedo()) return false

        redo()
        viewport.render()
        return true
    }
}