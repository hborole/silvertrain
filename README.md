# City Suggestion API

## Overview

This project implements a City Suggestion API that provides autocomplete suggestions for city names. Users can search for city names based on partial input and optionally sort results by proximity to a specified geographical location.

## Features

- **Autocomplete Search**: Users can search for cities by partially typing the city's name.
- **Proximity Sorting**: By providing optional latitude and longitude, users can get search results prioritized by how close they are to the specified coordinates.

## API Usage

### Get Suggestions

- **URL**: `/suggestions`
- **Method**: `GET`
- **URL Params**:
  - **Required**: `q=[string]` (partial or complete city name to search)
  - **Optional**:
    - `lat=[float]` (latitude of the user's location)
    - `long=[float]` (longitude of the user's location)
