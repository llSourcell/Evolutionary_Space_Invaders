/**
 * Created by Pablo Rodríguez Mier
 */

var invadersApp = invadersApp || {};

invadersApp.evolution = {
    evolve: function(pool, genes, mutation, effect){
        // Load from settings
        if (mutation === undefined) { mutation = 0.1 }
        if (effect === undefined) { effect = 0.5 }
        var offspring = [];
        pool.forEach(function (pair) {
            var p1 = pair[0];
            var p2 = pair[1];
            var children = [];

            for(var gen in genes){
                if (genes.hasOwnProperty(gen)) {
                    var gen1 = p1.genes[gen];
                    var gen2 = p2.genes[gen];
                    var min = (gen1 < gen2) ? gen1 : gen2;
                    var max = (gen1 > gen2) ? gen1 : gen2;
                    children[gen] = Math.random() * (max - min) + min;
                    if (Math.random() < mutation) {
                        // Mutate this gene
                        var value = chance.pickone([-1.0, 1.0]) * Math.random() * (genes[gen].max - genes[gen].min) * effect;
                        if ((children[gen] == genes[gen].min && value < 0) || (children[gen] == genes[gen].max && value > 0)) value = -value;
                        children[gen] = children[gen] + value;
                        if (children[gen] < genes[gen].min) children[gen] = genes[gen].min;
                        if (children[gen] > genes[gen].max) children[gen] = genes[gen].max;
                    }
                }
            }
            offspring.push([p1, p2, children]);
        });
        return offspring;
    },

    pool: function(population, size){
        var pool = [];
        while (pool.length < size){
            var p1 = this.binaryTournament(population);
            // Copy and remove the selected invader
            var pop2 = population.slice(0);
            pop2.splice(pop2.indexOf(p1),1);
            var p2 = this.binaryTournament(pop2);
            pool.push([p1, p2]);
        }
        return pool;
    },

    binaryTournament: function(population){
        var invader1 = this.pick(population);
        var invader2 = this.pick(population);

        if (invader1.fitness > invader2.fitness) {
            return invader1;
        } else {
            return invader2;
        }
    },

    pick: function(array){
        return array[Math.floor(Math.random()*array.length)];
    }
};