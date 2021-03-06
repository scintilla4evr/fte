import { UndoContext } from "./context"

let undoContexts: UndoContext[] = []
let redoContexts: UndoContext[] = []

export let undoContext = new UndoContext()

export function finalizeUndoContext(name?: string) {
    if (undoContext.actions.length) {
        undoContext.finalize(name)
        undoContexts.push(undoContext)

        if (redoContexts.length)
            redoContexts = []
    }
    undoContext = new UndoContext()
}

export function getUndoActionName() {
    if (!undoContexts.length) return null

    return undoContexts[undoContexts.length - 1].name
}

export function getRedoActionName() {
    if (!redoContexts.length) return null

    return redoContexts[redoContexts.length - 1].name
}

export function canUndo() {
    return undoContexts.length > 0
}

export function canRedo() {
    return redoContexts.length > 0
}

export function undo() {
    if (!canUndo()) return

    const ctx = undoContexts.pop()
    redoContexts.unshift(ctx)

    ctx.undo()
}

export function redo() {
    if (!canRedo()) return

    const ctx = redoContexts.shift()
    undoContexts.push(ctx)

    ctx.redo()
}