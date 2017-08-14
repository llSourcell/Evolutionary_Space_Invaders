# -*- coding: utf-8 -*-
# pylint: disable-msg=
"""
Created on Tue May 10 17:36:35 2016

This module contains the definition of all clases representing objects in the
game.

@author: T. Teijeiro
"""

import sge
import random
import game

class Invader(sge.dsp.Object):

    gene_props = {
        'scale': {
            'min': 1,
            'max': 7,
            'gen': lambda: random.gammavariate(4, 0.5)+1
        },

        'alpha': {
            'min': 5,
            'max': 255,
            'gen': lambda: random.randint(20, 255)
        },

        'xvelocity': {
            'min': 0.01,
            'max': 5,
            'gen': lambda: random.gammavariate(2, 0.4)
        },

        'yvelocity': {
            'min': 0.01,
            'max': 5,
            'gen': lambda: random.gammavariate(2, 0.3)
        },

        'x_prob_change_dir': {
            'min': 0.01,
            'max': 0.07,
            'gen': lambda: random.uniform(0.0, 0.05)
        },

        'y_prob_change_dir': {
            'min': 0.0,
            'max': 0.07,
            'gen': lambda: random.uniform(0.0, 0.05)
        },
    }


    @staticmethod
    def _generate_gen(name):
        v = Invader.gene_props[name]['gen']()
        max_v = Invader.gene_props[name]['max']
        min_v = Invader.gene_props[name]['min']
        if v < min_v:
            return min_v
        elif v > max_v:
            return max_v
        else:
            return v

    def __init__(self, **kwargs):
        # Generate random values and update with the ones provided in kwargs
        self.attributes = {k: self._generate_gen(k) for k in self.gene_props.keys()}
        self.attributes.update(kwargs)
        #print self.attributes

        self.genes = self.attributes

        super(Invader, self).__init__(sge.game.width/2., sge.game.height/2.- 80,
                                      sprite=sge.gfx.Sprite(name='invader'),
                                      image_blend=sge.gfx.Color('white'),
                                      checks_collisions=False)

        self.xvelocity = self.attributes.get('xvelocity')
        self.yvelocity = self.attributes.get('yvelocity')
        blend = int(self.attributes.get('alpha'))
        scale = self.attributes.get('scale')
        self.bbox_width = (self.sprite.width * scale)
        self.bbox_height = (self.sprite.height * scale)
        self.image_blend = sge.gfx.Color([blend, blend, blend])
        self.image_xscale = scale
        self.image_yscale = scale
        self.fitness = 0

    def event_step(self, time_passed, delta_mult):
        self.fitness += 1
        # Change directions
        if random.random() <= self.attributes.get('x_prob_change_dir'):
            self.xvelocity = -self.xvelocity
        if random.random() <= self.attributes.get('y_prob_change_dir'):
            self.yvelocity = -self.yvelocity

        # Bouncing off the edges and the wall
        if self.bbox_left < 0:
            self.bbox_left = 0
            self.xvelocity = abs(self.xvelocity)
        elif self.bbox_right > sge.game.current_room.width:
            self.bbox_right = sge.game.current_room.width
            self.xvelocity = -abs(self.xvelocity)
        if self.bbox_top < 0:
            self.bbox_top = 0
            self.yvelocity = abs(self.yvelocity)
        if self.bbox_bottom > game.RESY-(game.WALL_YOFFSET+game.WALL_HEIGHT):
            self.bbox_bottom = game.RESY-(game.WALL_YOFFSET+game.WALL_HEIGHT)
            self.yvelocity = -abs(self.yvelocity)

    def compare_fitness(self, other):
        if not isinstance(other, Invader):
            raise ValueError('Incomparable types')
        return self.fitness.__cmp__(other.fitness)


class Player(sge.dsp.Object):

    def __init__(self):
        self.lkey = "left"
        self.rkey = "right"
        x = sge.game.width / 2.
        y = sge.game.height - game.PLAYER_YOFFSET
        super(Player, self).__init__(x, y, sprite=sge.gfx.Sprite(name='nao'),
                                     tangible=False)

    def event_step(self, time_passed, delta_mult):
        # Movement
        key_motion = (sge.keyboard.get_pressed(self.rkey) -
                      sge.keyboard.get_pressed(self.lkey))
        self.xvelocity = key_motion * game.PLAYER_SPEED
        #"Animate" the sprite according to the moving direction
        if key_motion > 0 and self.image_xscale < 0:
            self.image_xscale = 1
        elif key_motion < 0 and self.image_xscale > 0:
            self.image_xscale = -1

        # Keep the paddle inside the window
        if self.bbox_left < 0:
            self.bbox_left = 0
        elif self.bbox_right > sge.game.current_room.width:
            self.bbox_right = sge.game.current_room.width

    def event_key_press(self, key, char):
        #Shooting
        if not sge.game.game_over and key == 'space':
            #The number of invaders must be higher than the minimum allowed,
            #and the number of bullets lower than the maximum
            ninvaders = sum(1 for o in sge.game.current_room.objects
                                                     if isinstance(o, Invader))
            nbullets = sum(1 for o in sge.game.current_room.objects
                                                if isinstance(o, PlayerBullet))
            if ninvaders > game.MIN_NINV and nbullets <= ninvaders/10:
                sge.game.current_room.add(PlayerBullet(self))


class PlayerBullet(sge.dsp.Object):

    def __init__(self, player):
        #The bullet appears out of the hands of nao
        x = (player.x if player.image_xscale == -1
                                             else player.x + player.bbox_width)
        ball_sprite = sge.gfx.Sprite(width=3, height=40, origin_x=4, origin_y=4)
        ball_sprite.draw_rectangle(0, 0, ball_sprite.width, ball_sprite.height,
                               fill=game.CITIUS_COLOR)
        super(PlayerBullet, self).__init__(x, player.y, sprite=ball_sprite)

    def event_create(self):
        self.yvelocity = -game.BULLET_START_SPEED

    def event_step(self, time_passed, delta_mult):
        if self.bbox_bottom < 0:
            self.destroy()
        else:
            #Collision detection only for bullets
            killed = self.collision(other=Invader)
            if killed:
                #We only kill the first colliding Invader
                killed[0].destroy()
                self.destroy()
