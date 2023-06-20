use super::cell::Cell;
use super::config::Config;
use rand::Rng;
use std::collections::{HashMap, HashSet};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct World {
    pub(crate) cells: HashSet<Cell>,
    neighbor_counts: HashMap<Cell, u8>,
}

#[wasm_bindgen]
impl World {
    pub fn new() -> Self {
        World {
            cells: HashSet::new(),
            neighbor_counts: HashMap::new(),
        }
    }

    #[wasm_bindgen(js_name = addCell)]
    pub fn add_cell(&mut self, world_x: i32, world_y: i32) {
        let cell = Cell::new(world_x, world_y);
        self.spawn(&cell);
    }

    #[wasm_bindgen(js_name = removeCell)]
    pub fn remove_cell(&mut self, world_x: i32, world_y: i32) {
        let cell = Cell::new(world_x, world_y);
        self.kill(&cell)
    }

    pub fn randomize(&mut self) {
        self.reset();

        let mut rng = rand::thread_rng();

        for x in -40..40 {
            for y in -40..40 {
                if rng.gen_range(0.0..1.0) < 0.5 {
                    self.add_cell(x, y);
                }
            }
        }
    }

    pub fn tick(&mut self, config: &Config) {
        let mut cells_to_kill: HashSet<Cell> = HashSet::new();
        let mut cells_to_spawn: HashSet<Cell> = HashSet::new();

        // Mark cells to kill
        self.cells.iter().for_each(|cell| {
            let neighbor_count = self.neighbor_counts.get(cell);

            if neighbor_count.is_none() || !config.survival_set.contains(neighbor_count.unwrap()) {
                cells_to_kill.insert(*cell);
            }
        });

        // Mark cells to spawn
        self.neighbor_counts.iter().for_each(|(cell, count)| {
            if config.birth_set.contains(count) && !self.cells.contains(cell) {
                cells_to_spawn.insert(*cell);
            }
        });

        // Kill cells
        cells_to_kill.iter().for_each(|cell| {
            self.kill(cell);
        });

        // Spawn cells
        cells_to_spawn.iter().for_each(|cell| {
            self.spawn(cell);
        });
    }
}

impl World {
    fn spawn(&mut self, cell: &Cell) {
        cell.generate_neighbors().iter().for_each(|neighbor| {
            self.increment_neighbor_count(neighbor);
        });

        self.cells.insert(*cell);
    }

    fn kill(&mut self, cell: &Cell) {
        cell.generate_neighbors().iter().for_each(|neighbor| {
            self.decrement_neighbor_count(neighbor);
        });

        self.cells.remove(cell);
    }

    fn increment_neighbor_count(&mut self, cell: &Cell) {
        *self.neighbor_counts.entry(*cell).or_insert(0) += 1;
    }

    fn decrement_neighbor_count(&mut self, cell: &Cell) {
        let neighbor_count_minus_one = self.neighbor_counts.get(cell).unwrap() - 1;

        if neighbor_count_minus_one == 0 {
            self.neighbor_counts.remove(cell);
        } else {
            self.neighbor_counts.insert(*cell, neighbor_count_minus_one);
        }
    }

    fn reset(&mut self) {
        self.cells.clear();
        self.neighbor_counts.clear();
    }

    pub fn get_bounds(&self) -> (i32, i32, u32, u32) {
        let mut min_x = i32::MAX;
        let mut max_x = i32::MIN;
        let mut min_y = i32::MAX;
        let mut max_y = i32::MIN;

        self.cells.iter().for_each(|cell| {
            min_x = i32::min(min_x, cell.x);
            max_x = i32::max(max_x, cell.x);
            min_y = i32::min(min_y, cell.y);
            max_y = i32::max(max_y, cell.y);
        });

        // Add 1 to each of these to account for the size of the final cell in the row or column
        let width = (max_x - min_x + 1) as u32;
        let height = (max_y - min_y + 1) as u32;

        // x, y, width, height
        (min_x, min_y, width, height)
    }
}