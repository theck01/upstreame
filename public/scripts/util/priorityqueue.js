define([], function () {

  function childrenIndicies (parentIndex) {
    return [parentIndex*2 + 1, parentIndex*2 + 2];
  }

  function downHeap (heap, index, comp) {
    var cindicies = childrenIndicies(index);
    var priorityIndex;

    if (comp(heap[cindicies[0]], heap[cindicies[1]])) {
      priorityIndex = cindicies[0];
    }
    else priorityIndex = cindicies[1];

    if (!comp(heap[index], heap[cindicies[0]]) ||
        !comp(heap[index], heap[cindicies[1]])) {
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
    var pindex = parentIndex(index);
    if (!comp(heap[pindex], heap[index])) {
      var temp = heap[pindex];
      heap[pindex] = heap[index];
      heap[index] = temp;
      upHeap(heap, pindex, comp);
    }
  }

  var PriorityQueue = function (compFunction) {
    this.comp = compFunction || function (a, b) { return a <= b; };
    this.heap = [];
  };


  PriorityQueue.prototype.peek = function () {
    return this.heap[0];
  };


  PriorityQueue.prototype.pop = function () {
    var retval = this.heap[0];

    this.heap[0] = this.heap.pop();
    downHeap(this.heap, 0, this.comp);

    return retval;
  };


  PriorityQueue.prototype.push = function (elem) {
    this.heap.push(elem);
    upHeap(this.heap, this.heap.length - 1, this.comp);
  };

  return PriorityQueue;
});
