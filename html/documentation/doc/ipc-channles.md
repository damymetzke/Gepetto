# ipc channels

## overview
### renderer to main
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

### main to renderer
<table>
    <tr>
        <th>Channel Name</th>
        <th>from</th>
        <th>to</th>
    <tr>
    <tr>
        <td>refresh-text-tree</td>
        <td>draw-object-manager</td>
        <td>object-editor-main</td>
    <tr>
    <tr>
        <td>refresh-selected-object</td>
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

<!--  todo: document specific channels -->