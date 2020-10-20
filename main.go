package main

import (
	"github.com/bill-rich/go-screeps/constants"
	"github.com/bill-rich/go-screeps/creep"
	"github.com/bill-rich/go-screeps/game"
	"github.com/bill-rich/go-screeps/memory"
	"github.com/gopherjs/gopherjs/js"
)

func main() {
	js.Global.Set("run", run)
}

func run() {
	runCreeps()
	return
}

type harvestTask struct {
	SourceID   string
	WorkAmount int
}

func runCreeps() {
	th := harvester{}
	for _, harvester := range th.find() {
		harvester.run()
	}
}

type creepI interface {
	find() []creep.Creep
	wanted() int
	run() error
	initialMemory() map[string]interface{}
}

type harvester struct {
	creep.Creep
}

func (h *harvester) run() {
	creepMem := h.Memory
	if h.Store.GetFreeCapacity(constants.RESOURCE_ENERGY) == 0 && creepMem["pickingUp"] != nil && creepMem["pickingUp"].(bool) == true {
		creepMem["pickingUp"] = false
	}
	println(creepMem["pickingUp"].(bool))
	if h.Store.GetUsedCapacity(constants.RESOURCE_ENERGY) == 0 && creepMem["pickingUp"] != nil && creepMem["pickingUp"].(bool) == false {
		println("Inner")
		creepMem["pickingUp"] = true
		h.Set("memory", creepMem)
	}
}

func (h *harvester) find() []harvester {
	game := game.GetGame()
	harvesters := []harvester{}
	mem := memory.GetMemory()
	for key, creepMemI := range mem["creeps"].(map[string]interface{}) {
		if creepMem, ok := creepMemI.(map[string]interface{}); ok {
			if creepMem["role"] != nil && creepMem["role"].(string) == "harvester" {
				harvesters = append(harvesters, harvester{game.Creeps[key]})
			}
		}
	}
	return harvesters
}
