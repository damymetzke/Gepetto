# ipc channels

## overview
### front to back
<table>
    <tr>
        <th>Channel Name</th>
        <th>from</th>
        <th>to</th>
    <tr>
    <tr>
        <td>update-object</td>
        <td>object-editor-main</td>
        <td>draw-object-manager</td>
    <tr>
    <tr>
        <td>select-object</td>
        <td>object-editor-main, object-editor-svg</td>
        <td>draw-object-manager</td>
    <tr>
    <tr>
        <td>select-transform-command</td>
        <td>object-editor-main</td>
        <td>draw-object-manager</td>
    <tr>
    <tr>
        <td>add-transform-command</td>
        <td>object-editor-main</td>
        <td>draw-object-manager</td>
    <tr>
    <tr>
        <td>import-svg</td>
        <td>import-svg-main</td>
        <td>draw-object-manager</td>
    <tr>
</table>

### back to front
<table>
    <tr>
        <th>Channel Name</th>
        <th>from</th>
        <th>to</th>
    <tr>
    <tr>
        <td>refresh-objects</td>
        <td>draw-object-manager</td>
        <td>object-editor-main, object-editor-svg</td>
    <tr>
    <tr>
        <td>add-svg-object</td>
        <td>svg-manager</td>
        <td>object-editor-svg</td>
    <tr>
    <tr>
        <td>update-svg-object</td>
        <td>svg-manager</td>
        <td>object-editor-svg</td>
    <tr>
    <tr>
        <td>remove-svg-object</td>
        <td>svg-manager</td>
        <td>object-editor-svg</td>
    <tr>
</table>

## channels - front to back

### update-object
keys:

- transformCommandUpdates
- name

### select-transform-command
keys:

- index

## channels - front to back

### refresh-objects
keys:

- objectTree
- selectedObject
- transformCommandIndex

### add-svg-object
keys:

- name
- data

### update-svg-object
keys:

- name
- data

### remove-svg-object
keys:

- name