# RailStats LA - Performance Data API
==================================

## API Reference:

### '/'
API Version Number (Semantic)

### '/network'
Summary data describing aggregate Metro performance over the entire train network.
##### Fields:
"ontime": Split into bins (1_min, 2_min... 5_min), each value describes the number of train arrivals that occurred within the period of time (given by the key) relative to a scheduled stop. For example: `"1_min": 250` means that 250 estimated train arrivals happened within 1 minute of a scheduled stop - this means up to 1 minute early or 1 minute late, so really it is a 2 minute window.

"total_arrivals_analyzed": This is the total number of estimated arrival times at stations. If you want to know how many trains arrived outside the maximum "5_min" ontime window, it is simply `total_arrivals_analyzed - ontime["5_min"]`.

"total_scheduled_arrivals": The total number of arrivals scheduled for the current date, across all lines. This is given since often (always) the number of estimated arrivals is less than the total scheduled. The major reason is that our data analysis cannot reliably estimate every arrival, but also sometimes scheduled trains do not run or are so delayed that they are reassigned to the next scheduled trip.

"mean_time_between": This is the average wait time between trains in seconds.

"timestamp": The timestamp of when this summary data was last calcalated.

### '/line'
A list of all the lines available to be queried.
##### Fields:
"lines": The list of all LA Metro Rail lines, given by their id code.

### '/line/{lineId}'
Summary data for individual train lines.
##### Fields:
Fields are identical to those for the '/network' endpoint.

There may also be some undocumented fields - these should be considered unreliable and not used.

Getting Started
---------------

```sh
# clone it
git clone https://github.com/metro-ontime/railstats_api.git
cd railstats_api

# Install dependencies
npm install

# Start development live-reload server (port 8080):
npm run dev

# Start production server (port 8080):
npm start
```
Docker Support
------
```sh
cd railstats_api

# Build your docker
docker build -t <your-docker-username>/railstats_api .

# run your docker
docker run -p 8080:8080 es6/api-service
#                 ^            ^
#          bind the port    container tag
#          to your host
#          machine port   

```
