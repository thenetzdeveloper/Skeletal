class Bone {
    constructor(x, y, length, size, color) {
        this.x = x;
        this.y = y;
        this.length = length;
        this.size = size;
        this.color = color;
    }
}
class SkeletalCreature {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.bones = [];
        this.velocity = { x: 2, y: 2 };
        this.isAutoWalking = true;
        this.mouseIdleTimer = null;
        this.mousePosition = { x: this.canvas.width / 2, y: this.canvas.height / 2 };
        this.speed = 10;
        this.initBones();
        window.addEventListener('resize', () => this.onResize());
        this.onResize();
        window.addEventListener('mousemove', (e) => {
            this.isAutoWalking = false;
            document.body.style.cursor = 'none';
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            clearTimeout(this.mouseIdleTimer);
            this.mouseIdleTimer = setTimeout(() => {
                this.isAutoWalking = true;
                document.body.style.cursor = 'default';
            }, 1000);
        });
    }
    initBones() {
        const numBones = 35;
        let length = 30;
        let size = 10;
        const startX = this.canvas.width / 2;
        const startY = this.canvas.height / 2;
        for (let i = 0; i < numBones; i++) {
            const color = `hsl(${180 - i * 2}, 90%, 60%)`;
            this.bones.push(new Bone(startX, startY, length, size, color));
            length *= 0.95;
            size *= 0.95;
        }
    }
    onResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - document.querySelector('nav').offsetHeight;
    }
    moveTo() {
        const head = this.bones[0];
        let targetX, targetY;

        if (this.isAutoWalking) {
            head.x += this.velocity.x;
            head.y += this.velocity.y;
            if (head.x + head.size / 2 > this.canvas.width || head.x - head.size / 2 < 0) {
                this.velocity.x *= -1;
            }
            if (head.y + head.size / 2 > this.canvas.height || head.y - head.size / 2 < 0) {
                this.velocity.y *= -1;
            }
        } else {
            targetX = this.mousePosition.x;
            targetY = this.mousePosition.y;
            const dx = targetX - head.x;
            const dy = targetY - head.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > this.speed) {
                const angle = Math.atan2(dy, dx);
                head.x += Math.cos(angle) * this.speed;
                head.y += Math.sin(angle) * this.speed;
            } else {
                head.x = targetX;
                head.y = targetY;
            }
        }
        for (let i = 1; i < this.bones.length; i++) {
            const prevBone = this.bones[i - 1];
            const bone = this.bones[i];
            const dx_follow = prevBone.x - bone.x;
            const dy_follow = prevBone.y - bone.y;
            const dist_follow = Math.sqrt(dx_follow * dx_follow + dy_follow * dy_follow);
            if (dist_follow > bone.length) {
                const angle_follow = Math.atan2(dy_follow, dx_follow);
                bone.x = prevBone.x - Math.cos(angle_follow) * bone.length;
                bone.y = prevBone.y - Math.sin(angle_follow) * bone.length;
            }
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.bones.length; i++) {
            const bone = this.bones[i];
            if (i > 0) {
                const prevBone = this.bones[i - 1];
                this.ctx.beginPath();
                this.ctx.moveTo(prevBone.x, prevBone.y);
                this.ctx.lineTo(bone.x, bone.y);
                this.ctx.strokeStyle = bone.color;
                this.ctx.lineWidth = bone.size;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(bone.x, bone.y, bone.size / 2, 0, Math.PI * 2);
                this.ctx.fillStyle = bone.color;
                this.ctx.fill();
            }
            if (i > 0 && i < this.bones.length / 2) {
                const prevBone = this.bones[i - 1];
                this.drawRibs(prevBone, bone);
            }
        }
    }
    drawRibs(bone1, bone2) {
        const angle = Math.atan2(bone2.y - bone1.y, bone2.x - bone1.x);
        const ribLength = bone1.size * 2;
        const numRibs = 3;
        for (let i = 1; i <= numRibs; i++) {
            const t = i / (numRibs + 1);
            const midX = bone1.x + (bone2.x - bone1.x) * t;
            const midY = bone1.y + (bone2.y - bone1.y) * t;

            const ribAngle = angle + Math.PI / 2;
            const ribX1 = midX - Math.cos(ribAngle) * ribLength;
            const ribY1 = midY - Math.sin(ribAngle) * ribLength;
            const ribX2 = midX + Math.cos(ribAngle) * ribLength;
            const ribY2 = midY + Math.sin(ribAngle) * ribLength;
            this.ctx.beginPath();
            this.ctx.moveTo(ribX1, ribY1);
            this.ctx.lineTo(ribX2, ribY2);
            this.ctx.strokeStyle = '#22c55e';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }
}
let creature;
window.onload = function () {
    const canvas = document.getElementById('creatureCanvas');
    const ctx = canvas.getContext('2d');
    creature = new SkeletalCreature(canvas);
    animate();
};
function animate() {
    creature.moveTo();
    creature.draw();
    requestAnimationFrame(animate);
}