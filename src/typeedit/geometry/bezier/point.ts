import { Point } from "../point";
import { BezierCurve } from "./curve";

export enum BezierPointType {
    free, auto
}

export class BezierPoint {
    public curve: BezierCurve = null

    constructor(
        public base: Point,
        public before: Point,
        public after: Point,
        public type: BezierPointType = BezierPointType.auto
    ) {}

    determineType() {
        const angle1 = this.after.angle(this.base)
        const angle2 = this.before.angle(this.base)

        if (Math.abs(angle1 - angle2 - Math.PI) < 0.0001)
            this.type = BezierPointType.auto
    }

    movePoint(point: Point, dPos: Point) {
        if (point === this.base) {
            this.base.move(dPos.x, dPos.y)
            this.before.move(dPos.x, dPos.y)
            this.after.move(dPos.x, dPos.y)
        } else {
            const otherPoint = point === this.before ?
                               this.after : this.before
            
            point.move(dPos.x, dPos.y)

            if (this.type === BezierPointType.auto) {
                const otherRadius = otherPoint.distance(this.base)
                const angle = point.angle(this.base)

                otherPoint.x = otherRadius * Math.cos(angle + Math.PI) + this.base.x
                otherPoint.y = otherRadius * Math.sin(angle + Math.PI) + this.base.y
            }
        }
    }
}