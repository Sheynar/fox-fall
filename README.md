# Fox Fall

This is an artillery helper for the game Foxhole

## Usage

### Controls

#### Mouse

- Drag `Left mouse` on the map
  - Pans the map
  - Hold `Shift` to rotate the map
- Drag `Right mouse` on the map to rotate the map
- Scroll the mouse wheel to zoom in and out
  - Hold `Control` to zoom faster
  - Hold `Shift` to zoom slower
  - Hold `Control` and `Shift` to zoom much slower
- Click a unit to select it and open its menu
- Click the compass to reset the viewport such that all units are visible and the camera faces north

#### Keyboard
- Arrow keys to move the map
- `Ctrl` and up/down arrow keys to zoom in and out
- `Ctrl` and left/right arrow keys to rotate

### Basic usage

1. Download the latest release from the [releases page](https://github.com/KaoSDlanor/fox-fall/releases)
2. Run the app and launch the game
3. Open the map in game and press the overlay button in the bottom right corner
4. Line up the grid of the overlay with the grid of the in game map
   1. Each cell of the overlay should match one of the smaller numbered cells that are visible in the game when you hover over them
   2. You can line up a 3x3 section of the overlay grid with one of the larger in game cells that are always visible
5. Create your artillery
   1. Click the plus button in the bottom dock
   2. Use the unit type dropdown to convert from "location" to "artillery"
   3. Drag the unit to where your artillery is on your map
   4. Optionally select the ammunition and platform for more tools
6. Set the wind direction and shell offset using the wind button in the bottom dock
7. Create the target you want to fire at using the same steps as 5. except with the target unit type
8. Fire the artillery with the given azimuth and distance
9.  Create a landing zone using the same steps as 5. except with the landing zone unit type and place it on the map where your shell landed
10. Click the adjust wind button to update the wind direction and shell offset
11. Use the updated azimuth and distance to obliterate some wardens

### Advanced usage

- Use the sync button in the bottom dock to link your overlay to other users. This negates the need to communicate firing solutions with gunners
  - Gunners should use the alternative gunner interface available via the dock at the bottom to simplify the process of getting firing solutions
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
3. Run `yarn run serve --filter=./packages/app` to start the development server or `yarn run serve --filter=./packages/overlay` to test the overlay application

### Build

Run `yarn run build:nocache --filter=./packages/overlay` to build the overlay application