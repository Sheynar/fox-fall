# Fox Fall

This is an artillery helper for the game Foxhole

## Usage

### Controls

#### Mouse

- Drag `Left mouse` on the map
  - Pans the map
  - Hold `Shift` to rotate the map
- Drag `Right mouse` on the map to rotate the map
- If rotation is locked right click to create a unit where the mouse cursor is located
- Scroll the mouse wheel to zoom in and out
  - Hold `Control` to zoom faster
  - Hold `Shift` to zoom slower
  - Hold `Control` and `Shift` to zoom much slower
- Click a unit to select it and open its menu
- Click the compass to reset the viewport such that all units are visible and the camera faces north

#### Keyboard

- Arrow keys to move the map
  - `Shift` and arrow keys to move the map a single cell over
  - `Ctrl` and up/down arrow keys to zoom in and out
  - `Ctrl` and left/right arrow keys to rotate
- `Ctrl`+`Tab` / `Ctrl`+`Shift`+`Tab` to cycle the selected unit

### Basic usage

1. Download the latest release from the [releases page](https://github.com/KaoSDlanor/fox-fall/releases)
2. Run the app and launch the game
3. Open the map in game and press the overlay button in the bottom right corner
4. Line up the grid of the overlay with the grid of the in game map with the Calibrate grid button in the bottom dock
5. (Optional) click the screenshot button to lock in your map/grid
6. Create your artillery
   1. Right click on the overlay where your artillery is located and select `Create unit`->`Artillery`
   2. (Optional) Drag the unit into precise position if it isn't quite where you wanted
   3. (Optional) select the ammunition and platform for more tools
7. Set the wind direction and shell offset using the wind button in the bottom dock
8. Create the target you want to fire at using the same steps as 5. except with the target unit type
9. Fire the artillery with the given azimuth and distance
10. Create a landing zone using the same steps as 5. except with the landing zone unit type and place it on the map where your shell landed
11. Click the adjust wind button to update the wind direction and shell offset
12. Use the updated azimuth and distance to obliterate some wardens

### Advanced usage

- Use the sync button in the bottom dock to link your overlay to other users. This negates the need to communicate firing solutions with gunners
  - Use the "Ready to fire" button in the bottom dock to communicate whether you are busy adjusting the firing solutions, it will synchronize the firing readiness state with other users
- If the target position is not clear on your map or if you want to rapidly change targets
  - Run into the field with some binoculars
  - When you can see the target create a spotter unit and position it on yourself on the overlay
  - Create a target positioned relative to the spotter unit
  - Enter the azimuth and distance of the target relative to the spotter unit
- Prepare firing solutions for future targets by putting location units on friendly bases that are likely to fall. Later on you can convert them into target units and use them to take back the captured bases
- Use the settings button in the bottom dock to reduce unit icon scales and adjust the grid line thickness and dash pattern so it is easier to line up with your in game map
- Once you have lined up the overlay with the game you can use the buttons next to the compass to disable certain types of movement of the overlay map to prevent accidental movement
- Change the "Positioned from" setting of a unit to make it automatically follow the movement of another unit and display its position relative to that unit. You can adjust the relative position information directly based on the measurements from in game binoculars
- Pin artillery / target units to make their firing arcs always visible

## Development

### Prerequisites

- Node.js 22.0.0 or higher
- Yarn 4

### Installation

1. Clone the repository
2. Run `yarn install` to install dependencies

### Running the app

- Running the web interface: `yarn run serve --filter=./packages/app`
- Running the sync server `yarn run serve --filter=./packages/server`
- Running the overlay: `yarn run serve --filter=./packages/overlay`

### Build

Run `yarn run build:nocache --filter=./packages/overlay` to build the overlay application