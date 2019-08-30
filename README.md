# Contract Execution Visualizer

An open source tool to visualize contract execution over time, powered by the [Open Contracting Data Standard](https://standard.open-contracting.org/latest/en/).

Live demo here: https://contract-viz.now.sh

## Develop

Clone this repo, install it and run:

```
yarn
yarn dev
```

## Use your own dataset

The **Contract Execution Visualizer** works by using a [record package](https://standard.open-contracting.org/latest/en/schema/record_package/) as its data source. You can use it to visualize your data by editing the _data/data.js_ file content as follows:

```javascript
export const dataset = <YOUR_RECORD_PACKAGE>
```

## Deployment

Deploy it to the cloud with [Now](https://zeit.co/now).

```
now
```

## Limitations

Know limitations of the tool include:

- Single currency support: all tenders and transactions should use the same currency.
- Single supplier per contract: each contract should have a single supplier.
