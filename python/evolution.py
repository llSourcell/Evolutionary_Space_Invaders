# -*- coding: utf-8 -*-
# pylint: disable=
"""
Created on Tue May  3 18:34:45 2016

@author: P. Rodriguez-Mier and T. Teijeiro
"""

import random
from operator import attrgetter


def bound_value(v, min_v, max_v):
    return min(max(min_v, v), max_v)


def recombinate(pairs, gene_props, mutation_probability=0.1, effect=0.5):
    offspring = []
    for p1, p2 in pairs:
        children_genes = {}
        for gen in p1.genes.keys():
            values = [p1.genes[gen], p2.genes[gen]]
            children_genes[gen] = random.uniform(min(values), max(values))
            if random.random() < mutation_probability:
                min_v = gene_props[gen]['min']
                max_v = gene_props[gen]['max']
                v = children_genes[gen]
                rv = random.choice([-1, 1]) * random.uniform(0, effect * (max_v - min_v))
                new_v_gauss = bound_value(random.gauss(v, (max_v - min_v) * effect), min_v, max_v)
                new_v = bound_value(v + rv, min_v, max_v)
                # print '----- Mutating ' + gen + ' - RV: ' + str(rv) + ' - V: ' + str(v) + ' - New: ' + str(new_v) + ' - Gaussian: ' + str(new_v_gauss)
                # rv = random.uniform(children_genes[gen], (max_v - min_v)*0.1)
                children_genes[gen] = new_v
        offspring.append(children_genes)
    return offspring


def mating_pool(population, num_of_pairs=10, evaluator=attrgetter('fitness')):
    evaluated_population = evaluate(population, evaluator)
    return zip(roulette_wheel(evaluated_population, k=num_of_pairs),
               roulette_wheel(evaluated_population, k=num_of_pairs))


def mating_pool_tournament(population, num_of_pairs=10, evaluator=attrgetter('fitness')):
    pool = []
    while len(pool) < num_of_pairs:
        # Generate a pair for mating
        p1 = tournament(population, evaluator)
        p2 = tournament(population - {p1}, evaluator)
        pool.append((p1, p2))
    return pool


def evaluate(population, evaluator=attrgetter('fitness')):
    return map(lambda x: (x, evaluator(x)), population)


def roulette_wheel(evaluated_population, k=10):
    sum_fitness = sum([v[1] for v in evaluated_population])
    selected = []
    while len(selected) < k:
        r = random.uniform(0, sum_fitness)
        for i in evaluated_population:
            r -= i[1]
            if r < 0:
                selected.append(i[0])
                break
    return selected


def tournament(population, evaluator, k=2):
    sample = population if len(population) < k else random.sample(population, k)
    return max(sample, key=evaluator)


if __name__ == '__main__':
    pop = {15, 18, 30, 100, 120, 60, 35, 40, 42}
    print mating_pool(pop, evaluator=lambda x: x)
    print mating_pool_tournament(pop, evaluator=lambda x: x)
