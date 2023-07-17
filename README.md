# kodo-core
It's bulky, but it's powerful.

## Install
npm install --save kodo-core

## Summary
`kodo-core` is used to describe & connect data together.
By doing so, kodo-core could be able to load & query data from one `kodo node` to another, in a predefined `kodo network`.

## Init & Usages
We first need to prepare the `data provider` for kodo-core, here's a default inside momory provider embeded in `kodo-core`.
> Check the test cases please there's a few examples.
Then we need write `expression` to describe the data relationship & connect them together.
By doing the 2 preparations, we can then give a detailed data from any `kodo node` & start to query.
It then will select & load all the related data via your giving.


## Design
* Kodo-Overview:
![Kodo-Overview](/design/Kodo-Overview.png)

* Kodo-Design:
![Kodo-Design](/design/Kodo-Design.png)
