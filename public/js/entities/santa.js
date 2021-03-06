/**
 * Santa entity
 */
game.SantaEntity = me.Entity.extend({
    /**
     * constructor
     */
    init: function (x, y) {

        // call the super constructor
        this._super(me.Entity, "init", [200, 140, {width : 78, height : 100}]);

        // create an animation using the cap guy sprites, and add as renderable
        this.renderable = game.santaTexture.createAnimationFromName([
            "Santa_Fly_AK_0", "Santa_Fly_AK_1", "Santa_Fly_AK_2", "Santa_Fly_AK_3",
            "Santa_Fly_Laser_0", "Santa_Fly_Laser_1", "Santa_Fly_Laser_2", "Santa_Fly_Laser_3",
            "Santa_Fly_Minigun_0", "Santa_Fly_Minigun_1", "Santa_Fly_Minigun_2", "Santa_Fly_Minigun_3",
            "Santa_Fly_Minigun_Spinning_0", "Santa_Fly_Minigun_Spinning_1", "Santa_Fly_Minigun_Spinning_2", "Santa_Fly_Minigun_Spinning_3",
            "Santa_Fly_default_0", "Santa_Fly_default_1", "Santa_Fly_default_2", "Santa_Fly_default_3",
            "Santa_Fly_shotgun_0", "Santa_Fly_shotgun_1", "Santa_Fly_shotgun_2", "Santa_Fly_shotgun_3",
            "Santa_Hadoken_on_0","Santa_Hadoken_on_1","Santa_Hadoken_on_2","Santa_Hadoken_on_3","Santa_Hadoken_on_4",
            "Santa_Hadoken_0","Santa_Hadoken_1","Santa_Hadoken_2","Santa_Hadoken_3"
        ]);

        this.renderable.addAnimation ("bullet", ["Santa_Fly_default_0","Santa_Fly_default_1","Santa_Fly_default_2","Santa_Fly_default_3"]);
        this.renderable.addAnimation ("shotgun", ["Santa_Fly_shotgun_0", "Santa_Fly_shotgun_1", "Santa_Fly_shotgun_2", "Santa_Fly_shotgun_3"]);
        this.renderable.addAnimation ("ak", ["Santa_Fly_AK_0", "Santa_Fly_AK_1", "Santa_Fly_AK_2", "Santa_Fly_AK_3"]);
        this.renderable.addAnimation ("hadoken", ["Santa_Hadoken_0","Santa_Hadoken_1","Santa_Hadoken_2","Santa_Hadoken_3"]);
        this.renderable.addAnimation ("hadoken_on", ["Santa_Hadoken_on_0","Santa_Hadoken_on_1","Santa_Hadoken_on_2","Santa_Hadoken_on_3","Santa_Hadoken_on_4"]);
        this.renderable.addAnimation ("laser", ["Santa_Fly_Laser_0", "Santa_Fly_Laser_1", "Santa_Fly_Laser_2", "Santa_Fly_Laser_3"]);
        this.renderable.addAnimation ("minigun", ["Santa_Fly_Minigun_0", "Santa_Fly_Minigun_1", "Santa_Fly_Minigun_2", "Santa_Fly_Minigun_3"]);
        this.renderable.addAnimation ("minigun_on", ["Santa_Fly_Minigun_Spinning_0", "Santa_Fly_Minigun_Spinning_1", "Santa_Fly_Minigun_Spinning_2", "Santa_Fly_Minigun_Spinning_3"]);

        this.renderable.setCurrentAnimation(game.weapon[0].type);
        this.renderable.anchorPoint = {"x" : 0, "y" : 0};
        this.anchorPoint = {"x" : 0, "y" : 0};
        this.body.addShape(new me.Ellipse(50,40,50,85));
        this.body.getShape(0).scale(0.01);
        this.body.getShape(0).translate(50,0);
        //this.body.removeShapeAt(0);
        // enable this, since the entity starts off the viewport
        this.alwaysUpdate = true;
        this.type = "santa";
		
		// collision shape
        this.collided = false;
        this.weapon = game.weapon[0];
        this.defaultWeapon = this.weapon;
        this.fireReleased = true;

        this.velY = 5;
        this.velX = 5;
        this.damage = 0;
        this.speed = 0;
        this.isProtected = false;
        this.pickWeaponTime = 0;

    },
	update: function(dt) {
        var that = this;
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.renderable.currentTransform.identity();
        if (me.input.isKeyPressed('shot')) {
            this.fireReleased = false;
            this.weapon.pressFire(this.pos.x, this.pos.y);
        } else {
            if (!this.fireReleased){
                this.fireReleased = true;
                this.weapon.releaseFire();
            }
        }

        if (this.weapon.class === "special" && this.weapon.magasine <= 0 ){
            this.weapon.resetWeapon();
            this.weapon = this.defaultWeapon;
            game.santa.renderable.setCurrentAnimation(this.weapon.type);
        }

        if (me.input.isKeyPressed('forward')) {
            this.pos.y -= (this.velY + this.speed);
            if (this.pos.y < 0) this.pos.y = 0;
        }
        if (me.input.isKeyPressed('backward')) {
            this.pos.y += (this.velY + this.speed);
            if (this.pos.y > me.game.viewport.height - this.height) this.pos.y = me.game.viewport.height - this.height;
        }
        if (me.input.isKeyPressed('left')) {
            this.pos.x -= (this.velX + this.speed);
            if (this.pos.x < 0) this.pos.x = 0;
        }
        if (me.input.isKeyPressed('right')) {
            this.pos.x += (this.velX + this.speed);
            if (this.pos.x > me.game.viewport.width - this.width) this.pos.x = me.game.viewport.width - this.width;
        }
        me.Rect.prototype.updateBounds.apply(this);
        if (this.collided) {
            this.weapon.resetWeapon();
            game.data.start = false;
            me.audio.play("lose");
            this.endAnimation();
        }
        me.collision.check(this);
		 // call the parent function
		this._super(me.Entity, "update", [dt]);
        return true;
    },

    onCollision: function(response) {
        var obj = response.b;
        if (obj.type === 'ennemy' || obj.type === 'attack') {
            me.device.vibrate(500);
            this.collided = true;
        }
        return false;
    },

    endAnimation: function() {
        me.game.viewport.fadeOut("#fff", 100);
        var currentPos = this.pos.y;
        this.endTween = new me.Tween(this.pos);
        this.endTween.easing(me.Tween.Easing.Exponential.InOut);
        this.renderable.currentTransform.identity();
        this.renderable.currentTransform.rotate(me.Math.degToRad(90));
        var finalPos = me.game.viewport.height - this.renderable.width/2 - 96;
        this.endTween
            .to({y: currentPos}, 1000)
            .to({y: finalPos}, 1000)
            .onComplete(function() {
                me.state.change(me.state.GAME_OVER);
            });
        this.endTween.start();
    }
});