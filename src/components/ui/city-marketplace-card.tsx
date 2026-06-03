import {
  CITY_DATA,
  CITY_TYPES,
  BASE_CONSUMPTION_BY_RESOURCE,
} from "@/lib/constants";
import {
  calculateBaseCityDemandByResource,
  calculateBaseCityPriceByResource,
  calculateBaseResourceCostByResource,
} from "@/lib/services";
import type {
  CityType,
  Inventory,
  MarketplaceTickResult,
  ResourceType,
} from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { NativeSelect } from "./native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

function formatLocationName(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

interface CityMarketplaceCardProps {
  inventory: Inventory;
  lastMarketplaceTick: MarketplaceTickResult | null;
  selectedCity: CityType;
  sellQuantityByResource: Partial<Record<ResourceType, number>>;
  offerPriceByResource: Partial<Record<ResourceType, number>>;
  onSelectedCityChange: (city: CityType) => void;
  onSellQuantityChange: (resource: ResourceType, value: number | undefined) => void;
  onOfferPriceChange: (resource: ResourceType, value: number | undefined) => void;
}

export function CityMarketplaceCard({
  inventory,
  lastMarketplaceTick,
  selectedCity,
  sellQuantityByResource,
  offerPriceByResource,
  onSelectedCityChange,
  onSellQuantityChange,
  onOfferPriceChange,
}: CityMarketplaceCardProps) {
  const baseDemandByResource = calculateBaseCityDemandByResource(selectedCity);
  const baseResourceCostByResource = calculateBaseResourceCostByResource();
  const baseCityPriceByResource = calculateBaseCityPriceByResource(selectedCity);

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl">City marketplace</CardTitle>
          <CardDescription>
            Base retail price and demand preview for{" "}
            {formatLocationName(selectedCity)}.
          </CardDescription>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
          <label
            htmlFor="marketplace-city-select"
            className="text-xs font-medium uppercase tracking-normal text-muted-foreground"
          >
            Marketplace city
          </label>
          <NativeSelect
            id="marketplace-city-select"
            aria-label="Marketplace city"
            value={selectedCity}
            onChange={(event) => onSelectedCityChange(event.target.value as CityType)}
            className="sm:max-w-[220px]"
          >
            {CITY_TYPES.map((city) => (
              <option key={city} value={city}>
                {formatLocationName(city)}
              </option>
            ))}
          </NativeSelect>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Resource</TableHead>
                <TableHead className="text-right">Base cost</TableHead>
                <TableHead className="text-right">Base city price</TableHead>
                <TableHead className="text-right">Base city demand</TableHead>
                <TableHead className="text-right">Inventory</TableHead>
                <TableHead className="text-right">Sell qty</TableHead>
                <TableHead className="text-right">Offer price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.keys(BASE_CONSUMPTION_BY_RESOURCE).map((resource) => (
                <TableRow key={resource}>
                  <TableCell className="font-medium capitalize">
                    {resource}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(
                      baseResourceCostByResource[resource as ResourceType],
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(
                      baseCityPriceByResource[resource as ResourceType],
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(
                      baseDemandByResource[resource as ResourceType],
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(inventory[resource as ResourceType])}
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      min={0}
                      aria-label={`Sell quantity for ${resource}`}
                      value={sellQuantityByResource[resource as ResourceType] ?? ""}
                      onChange={(e) =>
                        onSellQuantityChange(
                          resource as ResourceType,
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                      className="w-20 rounded border border-input bg-background px-2 py-1 text-right text-sm"
                      placeholder="0"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      aria-label={`Offer price for ${resource}`}
                      value={offerPriceByResource[resource as ResourceType] ?? ""}
                      onChange={(e) =>
                        onOfferPriceChange(
                          resource as ResourceType,
                          e.target.value === "" ? undefined : Number(e.target.value),
                        )
                      }
                      className="w-24 rounded border border-input bg-background px-2 py-1 text-right text-sm"
                      placeholder="0.00"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground">
          Population: {formatNumber(CITY_DATA[selectedCity].population)} | Wealth:{" "}
          {formatNumber(CITY_DATA[selectedCity].wealth, {
            decimals: 2,
            forceDecimals: true,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          Listed stock sells on each tick against Local Suppliers. Any unmet demand stays with Local Suppliers.
        </p>

        {lastMarketplaceTick && lastMarketplaceTick.city === selectedCity && (
          <div className="space-y-3 rounded-md border p-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Previous tick offer results</h3>
              <p className="text-sm text-muted-foreground">
                Offers resolved in {formatLocationName(lastMarketplaceTick.city)}.
              </p>
            </div>

            {lastMarketplaceTick.resources.map((resourceResult) => (
              <div key={resourceResult.resource} className="space-y-2">
                <p className="text-sm font-medium capitalize">
                  {resourceResult.resource} | Demand: {formatNumber(resourceResult.baseDemand)}
                </p>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead className="text-right">Offered qty</TableHead>
                        <TableHead className="text-right">Offer price</TableHead>
                        <TableHead className="text-right">Sold</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceResult.offers.map((offer) => (
                        <TableRow key={`${resourceResult.resource}-${offer.sellerName}`}>
                          <TableCell>{offer.sellerName}</TableCell>
                          <TableCell className="text-right">
                            {offer.offeredQuantity === null
                              ? "Infinity"
                              : formatNumber(offer.offeredQuantity)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(offer.offerPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatNumber(offer.soldQuantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
