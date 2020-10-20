package source

import (
	"github.com/bill-rich/go-screeps/object"
	"github.com/bill-rich/go-screeps/source"
	"github.com/gopherjs/gopherjs/js"
)

// NewSource takes a JS object and converts it to an extended source.
func NewSource(incoming *js.Object) Extended {
	s := source.Source{Object: object.Object{Object: incoming}}
	return Extended{&s}
}

// A wrapper for Source to allow further customization.
type Extended struct {
	*source.Source
}

// Calculates the number of WORK parts needed to fully harvest source before
// regeneration.
func (s Extended) WorkRequired() int {
	regen := s.TicksToRegeneration
	if regen == 0 {
		regen = 300
	}
	return (s.Energy / regen) / 2
}
