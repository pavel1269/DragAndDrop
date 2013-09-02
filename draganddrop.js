//
// Author: Pavel Grim, pavelgrim (at) gmail (dot) com
// Date: 14. 7. 2010
//
function DragAndDrop(list_id, order_id, margin_horizontal = 0, margin_vertical = 0, drag_out = false) {
	// List id.
	this.Id = list_id
	// Order input id.
	this.Save = order_id
	// Margin between items.
	this.MarginHorizontal = margin_horizontal
	this.MarginVertical = margin_vertical
	// If objects will appear, when draged, outside the dragable item.
	this.DragOut = drag_out
}

DragAndDrop.prototype.Drag = function(event)
{
	var obj = this.Object
	if (!obj) return
	
	event = event || window.event
	obj.style.zIndex += 100
	
	var pos = this.GetMousePosition(event)
	this.DragMove(pos, true)

	return false
}

DragAndDrop.prototype.DragMove = function(pos, bool)
{
	var obj = this.Object
	var ret = this.CheckPosition(pos, bool)
	var mouse = this.MouseOffset
	
	if (ret.x) obj.style.left = (pos.x - mouse.x) + "px"
	else obj.style.left = (pos.x - mouse.x - ret.pos.x) + "px"
	
	if (ret.y) obj.style.top = (pos.y - mouse.y) + "px"
	else obj.style.top = (pos.y - mouse.y - ret.pos.y) + "px"
	
	return
}

DragAndDrop.prototype.CheckPosition = function(mouse, bool)
{
	var pos = { x: mouse.x, y: mouse.y }
	pos.x -= this.Pos.x
	pos.x -= this.Offset.x
	pos.y -= this.Pos.y
	pos.y -= this.Offset.y
	
	var ret = this.CheckMoveOutside(pos)
	pos.x -= ret.pos.x
	pos.y -= ret.pos.y
	
	if (bool) this.CheckItemPosition(pos, mouse)
	
	return ret;
}

DragAndDrop.prototype.NewHoverPosition = function(pos)
{
	var hposition = 1
	var marhor = this.MarginHorizontal
	var marver = this.MarginVertical
	var width_ = this.ItemWidth
	var height = this.ItemHeight
	
	hposition += Math.floor((pos.x / (width_ + marhor)) + ((width_ / 2) / (width_ + marhor)))
	hposition += Math.floor((pos.y / (height + marver)) + ((height / 2) / (height + marver))) * this.ItemsPerRow
	
	return hposition
}

DragAndDrop.prototype.CheckItemPosition = function(pos, mouse)
{
	var hposition = this.NewHoverPosition(pos)
	var obj = this.Object
	var name = this.GetName(obj)
	var order = this.Order.split("|")
	var tmp2 = parseInt(this.ArraySearch(name, order, true))
	
	if ((tmp2 + 1) == hposition) return
	if (hposition > order.length) return
	
	obj.style.visibility = 'hidden'
	obj.style.left = 0
	obj.style.top = 0
	
	var list = document.getElementById(this.Id)
	if (hposition == order.length) {
		list.insertBefore(list.children[tmp2], list.children[order.length - 1])
		list.insertBefore(list.children[order.length - 1], list.children[order.length - 2])
	}
	else if (hposition > tmp2 && hposition < order.length) list.insertBefore(list.children[tmp2], list.children[hposition])
	else list.insertBefore(list.children[tmp2], list.children[hposition - 1])
	
	var pos = this.GetPosition(obj)
	pos.x += this.Offset.x
	pos.y += this.Offset.y
	this.MouseOffset = pos
	this.DragMove(mouse, false)
	
	obj.style.visibility = 'visible'
	this.FetchOrder()
	
	return
}

DragAndDrop.prototype.ArraySearch = function(needle, haystack, argStrict)
{
	// http://phpjs.org/functions/array_search
	var strict = !!argStrict
	var key = ""
	
	for (key in haystack) {
		if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
			return key
		}
	}
	
	return false
}

DragAndDrop.prototype.CheckMoveOutside = function(pos)
{
	var ret = { x: true, y: true, pos: { x: 0, y: 0 } }
	
	if (pos.x < 0) {
		ret.x = false
		ret.pos.x = pos.x
	} else if (pos.x > this.MaxX) {
		ret.x = false
		ret.pos.x = pos.x - this.MaxX
	}
	
	if (pos.y < 0) {
		ret.y = false
		ret.pos.y = pos.y
	} else if (pos.y > this.MaxY) {
		ret.y = false
		ret.pos.y = pos.y - this.MaxY
	}
	
	if (this.DragOut) {
		ret.x = true
		ret.y = true
	}
	
	return ret
}

DragAndDrop.prototype.ReleaseDrag = function(event)
{
	this.Skip = false
	
	var obj = this.Object
	if (!obj) return
	
	obj.style.zIndex -= 100
	obj.style.left = 0
	obj.style.top = 0
	this.Object = null
	
	return false
}

DragAndDrop.prototype.DragActive = function(event, instance)
{
	if (instance.Skip) {
		instance.Skip = false
		return true
	}
	
	instance.Skip = false
	var event = event || window.event
	var mouse = instance.GetMousePosition(event)
	var pos = instance.GetPosition(event.currentTarget)
	
	instance.Offset = { x: mouse.x - pos.x, y: mouse.y - pos.y }
	instance.Object = event.currentTarget
	instance.MouseOffset = { x: mouse.x, y: mouse.y }
	
	return false
}

DragAndDrop.prototype.DragDeactivate = function(event)
{
	this.Skip = true
	return true
}

DragAndDrop.prototype.GetMousePosition = function(event)
{
	if (event.pageX || event.pageY) {
		return { x: event.pageX, y: event.pageY }
	} else {
		return {
			x: event.clientX + document.body.scrollLeft - document.body.clientLeft,
			y: event.clientY + document.body.scrollTop  - document.body.clientTop
		}
	}
}

DragAndDrop.prototype.GetName = function(item)
{
	return item.getAttribute('name')
}

DragAndDrop.prototype.FetchOrder = function()
{
	var items = document.getElementById(this.Id).getElementsByTagName("li")
	var order = null
	for (i = 0, n = items.length; i < n; i++) {
		var tmp = this.GetName(items[i])
		
		if (order) order += "|" + tmp
		else order = tmp
	}
	
	this.Order = order
	document.getElementById(this.Save).value = order
	return
}

DragAndDrop.prototype.GetPosition = function(target)
{
	var left = 0
	var top  = 0

	while (target.offsetParent) {
		left += target.offsetLeft
		top  += target.offsetTop
		target = target.offsetParent
	}

	if (target.offsetLeft) left += target.offsetLeft
	if (target.offsetTop)  top  += target.offsetTop

	return { x: left, y: top }
}

DragAndDrop.prototype.InsertEvent = function(items)
{
	var pos = this.GetPosition(items[0])
	for (var i = 0, n = items.length; i < n; i++) {
		// Protect any input in the item.
		var inputs = items[i].getElementsByTagName("input")
		for (j = 0, k = inputs.length; j < k; j++) {
			inputs[j].onmousedown = this.DragDeactivate
		}
		
		// Get number of items per row.
		if (this.ItemsPerRow == 0 && i != 0) {
			var pos2 = this.GetPosition(items[i])
			if (pos.y != pos2.y) this.ItemsPerRow = i
		}
		
		var obj = this
		items[i].onmousedown = function(event) { return DragAndDrop.prototype.DragActive(event, obj); }
		
		// Hide named hyper text.
		var hrefs = items[i].getElementsByTagName("a")
		for (j = 0, k = hrefs.length; j < k; j++) {
			if (hrefs[j].name != "") {
				hrefs[j].style.display = "none"
			}
		}
	}
	
	if (this.ItemsPerRow == 0) this.ItemsPerRow = items.length
	
	return
}

DragAndDrop.prototype.MakeDragAble = function()
{
	var list = document.getElementById(this.Id)
	var items = list.getElementsByTagName("li")
	
	this.Pos = this.GetPosition(list)
	this.ItemHeight = items[0].offsetHeight
	this.ItemWidth = items[0].offsetWidth
	this.ItemsPerRow = 0
	this.FetchOrder()
	this.InsertEvent(items)
	
	var rows = Math.ceil(items.length / this.ItemsPerRow) - 1
	var columns = this.ItemsPerRow - 1
	
	this.MaxX = (columns * this.ItemWidth) + (columns * this.MarginHorizontal)
	this.MaxY = (rows * this.ItemHeight) + (rows * this.MarginVertical)
	return
}

