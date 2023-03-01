type InSlotType = string;
type OutSlotType = string;

const inSlot: InSlotType = 'in';
const outSlot: OutSlotType = 'out';
const branchOutSlot: OutSlotType = 'outBranch';
const multiOut: OutSlotType = 'multiOut';

interface INode {
  moveTo: (x: number, y: number) => void;
  getPos: () => number[];
  SetParent: (slot: InSlotType, parent: INode) => void;
  SetChildren: (slot: OutSlotType, child: INode) => void;
}

class XNode {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  moveTo(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getPos() {
    return [this.x, this.y];
  }
}

export class XSelect extends XNode implements INode {
  in: INode[] = [];
  out: INode[] = [];
  branch: INode[] = [];
  // It should be constructed from API's object
  constructor(x: number, y: number) {
    super(x, y);
  }

  SetParent(slot: InSlotType, parent: INode) {
    if (slot == inSlot) {
      this.in.push(parent);
    }
  }

  SetChildren(slot: string, child: INode) {
    if (slot == outSlot) {
      this.out.push(child);
    } else if (slot == branchOutSlot) {
      this.branch.push(child);
    }
    child.SetParent(inSlot, this);
  }
}

export class XCorref extends XNode implements INode {
  in: INode[] = [];
  out: INode[] = [];
  branch: INode[] = [];
  // It should be constructed from API's object
  constructor(x: number, y: number) {
    super(x, y);
  }

  SetParent(slot: InSlotType, parent: INode) {
    if (slot == inSlot) {
      this.in.push(parent);
    }
  }

  SetChildren(slot: OutSlotType, child: INode) {
    if (slot == outSlot) {
      this.out.push(child);
    } else if (slot == branchOutSlot) {
      this.branch.push(child);
    }
    child.SetParent(inSlot, this);
  }

  generateObject() {
    return {};
  }
}

export class XView extends XNode implements INode {
  in: INode[] = [];
  out: INode[] = [];
  branch: INode[] = [];
  // It should be constructed from API's object
  constructor(x: number, y: number) {
    super(x, y);
  }

  SetParent(slot: InSlotType, parent: INode) {
    if (slot == inSlot) {
      this.in.push(parent);
    }
  }

  SetChildren(slot: OutSlotType, child: INode) {
    if (slot == outSlot) {
      this.out.push(child);
    } else if (slot == branchOutSlot) {
      this.branch.push(child);
    }
    child.SetParent(inSlot, this);
  }

  generateObject() {
    return {};
  }
}

export class XSearch extends XNode implements INode {
  in: INode[] = [];
  out: INode[] = [];
  branch: INode[] = [];
  // It should be constructed from API's object
  constructor(x: number, y: number) {
    super(x, y);
  }

  SetParent(slot: InSlotType, parent: INode) {
    if (slot == inSlot) {
      this.in.push(parent);
    }
  }

  SetChildren(slot: OutSlotType, child: INode) {
    if (slot == outSlot) {
      this.out.push(child);
    } else if (slot == branchOutSlot) {
      this.branch.push(child);
    }
    child.SetParent(inSlot, this);
  }

  generateObject() {
    return {};
  }
}

// let select11: XSelect = new XSelect(1, 2);
// let coref1: XCorref = new XCorref(3, 4);
// select11.SetChildren(outSlot, coref1);
// console.log(select11);
// console.log(coref1.in[0].getPos());
