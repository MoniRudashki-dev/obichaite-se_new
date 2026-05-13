## BOX NOW

//MONI - branch -> box-now-sr

- ENV's - [done]
- transfer the folder from GNL - [done]
- prepare fetch the box now items for dropdown in server in checkout page - [done]
- add container to checkout page (add image, text and delivery price), if box now is showed, hide fields connected to other delivery
- add container with box now shipment choice and update state management
- if user pay with card add box now price to the payment process
- prepare body of order with box now setup

//ANATOLI

- add global component in admin with box now delivery price (admin can change the price in admin and the front end will get that price in checkout)
- add order fields to handle box now delivery (to be clear for the admin that order is with box now)
- handle make order functionality in the server
- make tests with payment and without payment (you can use test stripe keys for that)

//FINAL

- set up env variables in Vercel when all is in main
- make final test without payment
- make video to show the client how it's work
