- The discount should support usage limits, including total usage (e.g., limited to 20 customers) and optional per-user limits to prevent repeated abuse.

- The discount should have a valid time window, defined by a start and end date, and must only be applicable within that duration.

- The system should enforce POS-level constraints, allowing only a single discount to be applied per transaction unless explicitly configured otherwise.

- The discount should support scoped application, where it can apply to the entire order, specific products, or specific categories (e.g., cakes), using a structured scope definition.

- The discount should support multiple discount types, including percentage-based, fixed amount, and set-price overrides.

- The discount should allow product-level variation, where different products can receive different discount values when applicable.

- The system should support conditional rules, such as minimum order total, minimum quantity, or number of items required before the discount is applied.

- The discount should define how many items can be affected, such as limiting the discount to only one item in the order (e.g., PWD applies to only one product).

- The system should define a selection strategy for choosing which item gets discounted when limited (e.g., cheapest item, most expensive item, or manual selection).

- The discount should support eligibility constraints, such as applying only to specific user types (e.g., PWD, senior citizen).

- The system should enforce a price floor rule, ensuring that discounted prices do not go below a configurable percentage of the original price (e.g., at least 20% remains), unless explicitly allowed.

- The system should support priority and stacking rules, where discounts can either be mutually exclusive or combined, with clear priority handling when multiple discounts are eligible.

- The system should include usage tracking and audit logs, recording which discounts were applied, to which order, by which user, and the resulting discount amount.

- The discount application process should be handled through a centralized validation and computation service, ensuring all rules (eligibility, limits, scope, and pricing) are consistently enforced.

- The system should be optimized for performance by preloading active discounts and minimizing repeated queries during checkout.