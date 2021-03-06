/**
 * Enemies entities
 */
/**
 * EnemyEntity : basic enemies stats
 */
game.EnemyEntity = me.Entity.extend({
    init: function(x, y, settings, speed, radX, hp, points) {
        // Default params values
        /*************************************************************************/
        if (typeof speed === 'undefined') { this.speed = -5; } else {this.speed = speed;}
        if (typeof radX === 'undefined') { this.radX = 0; } else {this.radX = radX;}
        if (typeof hp === 'undefined') { this.hp = 1; } else {this.hp = hp;}
        if (typeof points === 'undefined') { this.points = 10; } else {this.points = points;}
        /*************************************************************************/
        // call the super constructor
        this._super(me.Entity, "init", [x, y, settings]);
        this.type = 'ennemy';
        this.alwaysUpdate = true;
        this.pos.add(this.body.vel);
        this.body.vel.set(this.speed, 0);
        this.body.vel = this.body.vel.rotate(this.radX);
        this.animationSpeed = 333;
    },

    update: function(dt) {
        // mechanics
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.width)
            me.game.world.removeChild(this);

        if (this.pos.y < 0 && this.radX > 0 || (this.pos.y + this.height) > me.game.viewport.height && this.radX < 0)
            this.radX = - this.radX;

        this.body.vel.set(this.speed, 0);
        this.body.vel = this.body.vel.rotate(this.radX);
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, "update", [dt]);
        return true;
    },

    destroy: function(damage){
        // Already dead ?
        if (this.hp > 0){
            this.hp -= damage;
            if (this.hp <= 0){
                game.data.steps += this.points;
                me.game.world.removeChild(this);
                
                var rdm = Math.random();
                if (rdm > 0.7){
                    if (rdm > 0.975)
                        me.game.world.addChild(new me.pool.pull('shieldDrop', this.pos.x, this.pos.y), 10);
                    else if (rdm > 0.95)
                        me.game.world.addChild(new me.pool.pull('weaponDrop', this.pos.x, this.pos.y), 10);
                    else if (rdm > 0.90)
                        me.game.world.addChild(new me.pool.pull('speedUpDrop', this.pos.x, this.pos.y), 10);
                    else if (rdm > 0.85)
                        me.game.world.addChild(new me.pool.pull('damageUpDrop', this.pos.x, this.pos.y), 10);
                    else
                        me.game.world.addChild(new me.pool.pull('presentDrop', this.pos.x, this.pos.y), 10);
                }
                me.audio.play("enemyDeath");
            }
            else if (this.hp > 0)
                me.audio.play("enemyHurt" + me.Math.random(1, 5));
        }
    }
});
/**
 * RangedEnemyEntity : launch ranged attacks
 */
game.RangedEnemyEntity = game.EnemyEntity.extend({
    init: function (x, y, settings, speed, radX, hp, points, attackName, attackSplitNb, attackVelX, attackVelY) {
        this._super(game.EnemyEntity, "init", [x, y, settings, speed, radX, hp, points]);
        this.attackVelX = attackVelX;
        this.attackVelY = attackVelY;
        this.animationSpeed = 666;
        if (typeof attackName === 'undefined') { this.attackName = 'mageAttackEntity'; } else {this.attackName = attackName;}
        if (typeof attackSplitNb === 'undefined') { this.attackSplitNb = 0; } else {this.attackSplitNb = attackSplitNb;}
        this.startAttackTimer(this.animationSpeed * this.attackFrames.length);
    },

    startAttackTimer : function (timerDelay) {
        let _this = this;
        this.intervalID = me.timer.setInterval(function () {
            if(_this.attackName === 'mageAttackEntity')
                me.game.world.addChild(new me.pool.pull('mageAttackEntity', _this.pos.x - 5, _this.pos.y + 24, _this.attackVelX, _this.attackVelY, true, _this.attackSplitNb), 14);
            if(_this.attackName === 'archerAttackEntity')
                me.game.world.addChild(new me.pool.pull('archerAttackEntity', _this.pos.x - 5, _this.pos.y + 40, _this.attackVelX, _this.attackVelY, false), 14);
        }, timerDelay);
    },

    onDeactivateEvent : function () {
        me.timer.clearInterval(this.intervalID);
    }
});
/**
 * MageEnemyEntity
 */
game.MageEnemyEntity = game.RangedEnemyEntity.extend({
    init: function(x, y, speed, radX, hp, points, attackSplitNb, attackVelX, attackVelY) {
        if (typeof attackSplitNb === 'undefined') { this.attackSplitNb = 3; } else {this.attackSplitNb = attackSplitNb;}
		if (typeof attackVelX === 'undefined') { this.attackVelX = -3; } else {this.attackVelX = attackVelX;}
		if (typeof attackVelY === 'undefined') { this.attackVelY = 0; } else {this.attackVelY = attackVelY;}
        // Texture
        this.attackFrames = [0,1,2];
        this._super(game.RangedEnemyEntity, "init", [x, y, {width : 77, height : 69}, speed, radX, hp, points, 'mageAttackEntity', this.attackSplitNb, this.attackVelX, this.attackVelY]);
        this.renderable = game.mageEnemyTexture.createAnimationFromName([
            "2_ATTACK_001", "2_ATTACK_002", "2_ATTACK_003"
        ]);
        this.renderable.addAnimation ("attack", [0,1,2], this.animationSpeed);
        this.renderable.setCurrentAnimation("attack");
        this.renderable.anchorPoint = {"x" : 0, "y" : 0};
        this.anchorPoint = {"x" : 0, "y" : 0};
        this.body.addShape(new me.Ellipse(40,40,60,69));
        this.body.getShape(0).scale(0.01);
        this.body.getShape(0).translate(40,20);
    }
});
/**
 * ArcherEnemyEntity
 */
game.ArcherEnemyEntity = game.RangedEnemyEntity.extend({
    init: function(x, y, speed, radX, hp, points) {
        // Texture
        this.attackFrames = [0,1,2];
        this._super(game.RangedEnemyEntity, "init", [x, y, {width : 78, height : 80}, speed, radX, hp, points, 'archerAttackEntity']);
        this.renderable = game.archerEnemyTexture.createAnimationFromName([
            "ARCHER_ATTACK_000", "ARCHER_ATTACK_001", "ARCHER_ATTACK_002"
        ]);
        this.renderable.addAnimation ("attack", [0,1,2], this.animationSpeed);
        this.renderable.setCurrentAnimation("attack");
        this.renderable.anchorPoint = {"x" : 0, "y" : 0};
        this.anchorPoint = {"x" : 0, "y" : 0};
        this.body.addShape(new me.Ellipse(45,40,60,80));
        this.body.getShape(0).scale(0.01);
        this.body.getShape(0).translate(40,20);
    }
});
/**
 * MeleeEnemyEntity
 */
game.MeleeEnemyEntity = game.EnemyEntity.extend({
    init: function(x, y, speed, radX, hp, points) {
        // Texture and animation
        this._super(game.EnemyEntity, "init", [x, y, {width : 80, height : 80}, speed, radX, hp, points]);
        this.renderable = game.meleeEnemyTexture.createAnimationFromName([
            "5_ATTACK_000", "5_ATTACK_002", "5_ATTACK_003", "5_ATTACK_004", "5_ATTACK_005"
        ]);
        let attackFrames = [1,2,3,4,5];
        this.animationSpeed = 200;
        this.renderable.addAnimation ("attack", attackFrames,this.animationSpeed);
        this.renderable.setCurrentAnimation("attack");
        this.renderable.anchorPoint = {"x" : 0, "y" : 0};
        this.anchorPoint = {"x" : 0, "y" : 0};
        this.body.addShape(new me.Ellipse(40,40,70,80));
        this.body.getShape(0).scale(0.01);
        this.body.getShape(0).translate(40,20);
    }
});
/**
 * MageAttackEntity
 */
game.MageAttackEntity = me.Entity.extend({

    init: function(x, y, velX, velY, explode, explodesIntoNb, rad) {
        let settings = {};
        settings.image = this.image = me.loader.getImage('mageAttack');
        settings.width = 22;
        settings.height= 22;
        settings.framewidth = 22;
        settings.frameheight = 22;
        this.explosionDelay = me.Math.random(1000,2000);
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.pos.add(this.body.vel);
        this.body.gravity = 0;
        this.body.addShape(new me.Ellipse(0,0,settings.width,settings.height));
        this.body.removeShapeAt(0);
        this.type = 'attack';
        if (typeof velX === 'undefined') { this.velX = -3; } else {this.velX = velX;}
        if (typeof velY === 'undefined') { this.velY = 0; } else {this.velY = velY;}
        if (typeof explode === 'undefined') { this.explode = false; } else {this.explode = explode;}
        if (typeof explodesIntoNb === 'undefined') { this.explodesIntoNb = 0; } else {this.explodesIntoNb = explodesIntoNb;}
        this.body.vel.set(this.velX, this.velY);
        if (typeof rad != 'undefined' && !this.explode) {
            this.body.vel = this.body.vel.rotate(rad);
            this.rad = rad;
        }
        this.timeCreated = Date.now();
    },

    update: function(dt) {

        // mechanics
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.width || this.pos.y < -this.height || this.pos.y > me.game.viewport.width) {
            me.game.world.removeChild(this);
        }
        //explode
        if(((Date.now() - this.timeCreated) >= this.explosionDelay) && this.explode){
            this.createExplosion();
            this.explode = false;
            me.game.world.removeChild(this);
        }
        this.body.vel.set(this.velX, this.velY);
        if (this.rad != undefined && !this.explode)
            this.body.vel = this.body.vel.rotate(this.rad);
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    },

    createExplosion : function () {
        for(let i = 0; i < this.explodesIntoNb; i++) {
            let rad = me.Math.degToRad(360 / this.explodesIntoNb * (i + 1));
            me.game.world.addChild(new me.pool.pull('mageAttackEntity', this.pos.x, this.pos.y, 0, -5, false, this.explodesIntoNb, rad), 14);
            me.audio.play("explosion",false,null,0.1);
        }
    }
});
/**
 * ArcherAttackEntity
 */
game.ArcherAttackEntity = me.Entity.extend({

    init: function(x, y, velX, velY) {
        let settings = {};
        settings.image = this.image = me.loader.getImage('archerAttack');
        settings.width = 50;
        settings.height= 9;
        settings.framewidth = 50;
        settings.frameheight = 9;
        this._super(me.Entity, 'init', [x, y, settings]);
        this.alwaysUpdate = true;
        this.pos.add(this.body.vel);
        this.body.gravity = 0.2;
        this.type = 'attack';
        if (typeof velX === 'undefined') { this.velX = -6; } else {this.velX = velX;}
        if (typeof velY === 'undefined') { this.velY = 0; } else {this.velY = velY;}

        this.body.vel.set(this.velX, this.velY);
    },

    update: function(dt) {

        // mechanics
        if (!game.data.start) {
            return this._super(me.Entity, 'update', [dt]);
        }
        this.pos.add(this.body.vel);
        if (this.pos.x < -this.width || this.pos.y < -this.height || this.pos.y > me.game.viewport.width) {
            me.game.world.removeChild(this);
        }
        this.body.vel.set(this.velX, this.velY);
        me.Rect.prototype.updateBounds.apply(this);
        this._super(me.Entity, 'update', [dt]);
        return true;
    }
});

