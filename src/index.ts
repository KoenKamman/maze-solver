import { evolve, Chromosome } from "evolve-ga";
import Maze from './maze';
import { MAZE_START, MAZE_END, MAZE_DATA, MAZE_REQUIRED_STEPS } from './mazes/maze1';
import { Moves, CellTypes } from './enums';
import logUpdate from "log-update";

const LOG_FITTEST = 10;
const END_REACHED_BONUS = 100;
const STEPS_BOUNCED_WEIGHT = 1;
const STEPS_TAKEN_WEIGHT = 1;
const STEPS_REPEATED_WEIGHT = 1;
const DISTANCE_TO_END_WEIGHT = 1;
const DISTANCE_FROM_START_WEIGHT = 1;
const POPULATION_SIZE = 10000;
const CHROMOSOME_LENGTH = MAZE_REQUIRED_STEPS + 5;
const MUTATION_CHANCE = 0.1;

let solved = false;
let generation = 0;

const fitnessFunction = (chromosome: Chromosome): number => {
    let maze = new Maze(MAZE_START, MAZE_END, MAZE_DATA);
    let stepsBounced = 0;
    let stepsTaken = 0;
    let stepsRepeated = 0;
    let reachedEnd = false;
    let currentPosition = maze.getStart();
    for (let i = 0; i < chromosome.genes.length; i++) {
        const newPosition = maze.move(currentPosition, chromosome.genes[i] as number);
        const cellType = maze.getCellType(newPosition);
        if (cellType === CellTypes.CLOSED) {
            stepsBounced += 1;
        } else if (cellType === CellTypes.START || cellType === CellTypes.EXPLORED) {
            currentPosition = newPosition;
            stepsRepeated += 1;
        } else if (cellType === CellTypes.OPEN) {
            currentPosition = newPosition;
            maze.setCellType(newPosition, CellTypes.EXPLORED);
            stepsTaken += 1;
        } else if (cellType === CellTypes.END) {
            stepsTaken += 1;
            reachedEnd = true;
            currentPosition = newPosition;
            if (stepsTaken + stepsBounced + stepsRepeated === MAZE_REQUIRED_STEPS) solved = true;
        }
    }
    logUpdate(`\n${maze.toString()}`);
    const stepsTakenWeighted = stepsTaken * STEPS_TAKEN_WEIGHT;
    const stepsBouncedWeighted = stepsBounced * STEPS_BOUNCED_WEIGHT;
    const stepsRepeatedWeighted = stepsRepeated * STEPS_REPEATED_WEIGHT;
    const distanceFromStartWeighted = maze.getDistanceFromStart(currentPosition) * DISTANCE_FROM_START_WEIGHT;
    const distanceToEndWeighted = maze.getDistanceToEnd(currentPosition) * DISTANCE_TO_END_WEIGHT;
    let fitness = stepsTakenWeighted - stepsRepeatedWeighted - stepsBouncedWeighted + distanceFromStartWeighted - distanceToEndWeighted;
    if (reachedEnd) fitness += END_REACHED_BONUS;
    return fitness;

}

const algorithm = evolve({
    fitnessFunction: fitnessFunction,
    populationSize: POPULATION_SIZE,
    chromosomeLength: CHROMOSOME_LENGTH,
    mutationChance: MUTATION_CHANCE,
    possibleGenes: [Moves.UP, Moves.RIGHT, Moves.DOWN, Moves.LEFT]
});


while (!solved) {
    const population = algorithm.run();
    population.sort((a: Chromosome, b: Chromosome): number => b.fitness - a.fitness);
    let logOutput = `\nGeneration #${generation} Fittest ${LOG_FITTEST}\n`;
    for (let i = 0; i < LOG_FITTEST && i < population.length; i++) {
        logOutput += `F: ${population[i].fitness} G: ${population[i].genes.join("")}\n`;
    }
    logUpdate(logOutput);
    logUpdate.done();
    generation += 1;
    if (solved) {
        fitnessFunction(population[0]);
        logUpdate.done();
        logUpdate(`solution: ${population[0].genes.slice(0, MAZE_REQUIRED_STEPS).join("")}`);
        logUpdate.done();
    }
}
