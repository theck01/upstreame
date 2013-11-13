define([], function () {

  function childrenIndicies (parentIndex) {
    return [parentIndex*2 + 1, parentIndex*2 + 2];
  }

  function downHeap (heap, index, comp) {
    var cindicies = childrenIndicies(index);
    var priorityIndex;

    // if the children indicies are outside of the heap bounds downHeap
    // operation is complete
    if (cindicies[0] >= heap.length) return;

    // if only one child is in heap bounds, downHeap that one child
    if (cindicies[1] >= heap.length) priorityIndex = cindicies[0];
    // else compare with the highest priority child
    else if (comp(heap[cindicies[0]], heap[cindicies[1]])) {
      priorityIndex = cindicies[0];
    }
    else priorityIndex = cindicies[1];

    if (comp(heap[priorityIndex], heap[index])) {
      var temp = heap[index];
      heap[index] = heap[priorityIndex];
      heap[priorityIndex] = temp;
      downHeap(heap, priorityIndex, comp);
    }
  }

  function parentIndex (childIndex) {
    return Math.floor((childIndex - 1)/2);
  }

  function upHeap (heap, index, comp) {
    // if index is the top of the heap or beyond bounds, upHeap operation is
    // complete
    if (index <= 0) return;

    var pindex = parentIndex(index);

    if (!comp(heap[pindex], heap[index])) {
      var temp = heap[pindex];
      heap[pindex] = heap[index];
      heap[index] = temp;
      upHeap(heap, pindex, comp);
    }
  }

  // PriorityQueue, queue ordered by comparision function of elements, or <=
  //
  // Arguments:
  //   compFunction: Comparision function. If first argument is of higher
  //                 priority return true, else return false
  var PriorityQueue = function (compFunction) {
    this.comp = compFunction || function (a, b) { return a <= b; };
    this.heap = [];
  };


  // peek returns highest priority element without removing it from the queue
  //
  // Returns:
  //   Highest priority element in the queue
  PriorityQueue.prototype.peek = function () {
    return this.heap[0];
  };


  // pop returns highest priority element and removes it from the queue
  //
  // Returns:
  //   Highest priority element in the queue
  PriorityQueue.prototype.pop = function () {
    var retval = this.heap[0];

    var lastElement = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = lastElement;
      downHeap(this.heap, 0, this.comp);
    }

    return retval;
  };


  // push adds an element to the appropriate location in the priority queue
  PriorityQueue.prototype.push = function (elem) {
    this.heap.push(elem);
    upHeap(this.heap, this.heap.length - 1, this.comp);
  };

  return PriorityQueue;
});
