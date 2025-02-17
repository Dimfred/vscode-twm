# [VSCode TWM](https://marketplace.visualstudio.com/items?itemName=dimfred.vscode-twm)

A simple tiling layout for vscode.

## Settings and Commands

```jsonc
{
    "key": "ctrl+t ctrl+w",
    "command": "twm.start",
},
{
    "key": "ctrl+t ctrl+s",
    "command": "twm.stop",
}

// settings
"twm.centerWidth": 0.55, // in %
```

## TODOs

- [ ] Opening the output window, causes the mid window to be copied to the left? Old center is null at that point dunno why.