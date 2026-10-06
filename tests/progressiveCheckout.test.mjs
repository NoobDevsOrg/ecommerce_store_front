import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const storage = new Map();
const localStorage = new Map();
const listeners = new Map();
const storageApi = (values) => ({
  getItem: (key) => values.get(key) || null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
});
globalThis.window = {
  sessionStorage: storageApi(storage),
  localStorage: storageApi(localStorage),
  addEventListener: (type, listener) => listeners.set(type, listener),
  removeEventListener: (type) => listeners.delete(type),
  dispatchEvent: (event) => listeners.get(event.type)?.(event),
};

const checkoutStorage = await import("../src/lib/checkoutSession.js");
const customerStorage = await import("../src/lib/customerAuth.js");
const cartStore = await import("../src/store/cartStore.js");
const forgotPassword = await import("../src/lib/forgotPassword.js");
const expectedDelivery = await import("../src/lib/expectedDeliveryDate.js");
const productUrl = await import("../src/lib/productUrl.js");
const apiSource = readFileSync(new URL("../src/lib/api.js", import.meta.url), "utf8");
const checkoutSource = readFileSync(new URL("../src/app/checkout/page.js", import.meta.url), "utf8");
const productSource = readFileSync(new URL("../src/components/product/ProductActions.js", import.meta.url), "utf8");
const headerSource = readFileSync(new URL("../src/components/layout/Header.js", import.meta.url), "utf8");
const searchPageSource = readFileSync(new URL("../src/app/search/page.js", import.meta.url), "utf8");
const publicApiSource = readFileSync(new URL("../src/lib/publicApi.js", import.meta.url), "utf8");
const productDetailPageSource = readFileSync(new URL("../src/app/products/[slug]/page.js", import.meta.url), "utf8");
const productNotFoundSource = readFileSync(new URL("../src/app/products/[slug]/not-found.js", import.meta.url), "utf8");
const productCardSource = readFileSync(new URL("../src/components/product/ProductCard.js", import.meta.url), "utf8");
const customerAuthHookSource = readFileSync(new URL("../src/components/hooks/useCustomerAuth.js", import.meta.url), "utf8");
const loginSource = readFileSync(new URL("../src/app/login/page.js", import.meta.url), "utf8");
const forgotSource = readFileSync(new URL("../src/app/forgot-password/page.js", import.meta.url), "utf8");
const adminOrderDetailSource = readFileSync(new URL("../src/app/admin/orders/[orderReference]/page.js", import.meta.url), "utf8");
const adminOrdersSource = readFileSync(new URL("../src/app/admin/orders/page.js", import.meta.url), "utf8");
const adminCustomersSource = readFileSync(new URL("../src/app/admin/clients/page.js", import.meta.url), "utf8");
const adminPaymentsSource = readFileSync(new URL("../src/app/admin/payments/page.js", import.meta.url), "utf8");
const adminInventorySource = readFileSync(new URL("../src/app/admin/inventory/page.js", import.meta.url), "utf8");
const adminDashboardSource = readFileSync(new URL("../src/app/admin/dashboard/page.js", import.meta.url), "utf8");
const dateRangeSource = readFileSync(new URL("../src/components/admin/DateRangeFilter.js", import.meta.url), "utf8");
const adminDateSource = readFileSync(new URL("../src/lib/adminDate.js", import.meta.url), "utf8");
const customerNotificationsSource = readFileSync(new URL("../src/app/account/notifications/page.js", import.meta.url), "utf8");
const adminNotificationsSource = readFileSync(new URL("../src/app/admin/notifications/page.js", import.meta.url), "utf8");
const notificationListSource = readFileSync(new URL("../src/components/notifications/NotificationList.js", import.meta.url), "utf8");
const notificationCountSource = readFileSync(new URL("../src/lib/notificationCount.js", import.meta.url), "utf8");
const orderDetailSource = readFileSync(new URL("../src/app/account/orders/[orderReference]/page.js", import.meta.url), "utf8");
const celebrationSource = readFileSync(new URL("../src/components/orders/PaymentSuccessCelebration.js", import.meta.url), "utf8");
const deliveredReviewSource = readFileSync(new URL("../src/components/orders/DeliveredReviewPrompt.js", import.meta.url), "utf8");
const productListingSource = readFileSync(new URL("../src/app/products/page.js", import.meta.url), "utf8");
const productDetailSource = readFileSync(new URL("../src/app/products/[slug]/ProductDetailClient.js", import.meta.url), "utf8");
const relatedProductsSource = readFileSync(new URL("../src/components/product/RelatedProductSection.js", import.meta.url), "utf8");
const productReviewsSource = readFileSync(new URL("../src/components/product/ProductReviews.js", import.meta.url), "utf8");
const homeSource = readFileSync(new URL("../src/app/page.js", import.meta.url), "utf8");
const premiumHeroSource = readFileSync(new URL("../src/components/home/PremiumHero.js", import.meta.url), "utf8");
const dynamicHeroSource = readFileSync(new URL("../src/components/home/DynamicHeroSlider.js", import.meta.url), "utf8");
const showroomSource = readFileSync(new URL("../src/components/home/ShowroomExperience.js", import.meta.url), "utf8");
const showroomMotionSource = readFileSync(new URL("../src/components/home/ShowroomMotion.js", import.meta.url), "utf8");
const finalCtaMotionSource = readFileSync(new URL("../src/components/home/FinalCtaMotion.js", import.meta.url), "utf8");
const homeExperienceGateSource = readFileSync(new URL("../src/components/home/HomeExperienceGate.js", import.meta.url), "utf8");
const addressContact = await import("../src/lib/addressContact.js");

test("header search uses each submitted value and the mounted search page follows every URL query", () => {
  assert.match(headerSource, /const query = searchQuery\.trim\(\)/);
  assert.match(headerSource, /router\.push\(`\/search\?q=\$\{encodeURIComponent\(query\)\}`\)/);
  assert.match(headerSource, /\[pathname, urlSearchQuery\]/);
  assert.match(searchPageSource, /const query = searchParams\.get\("q"\)\?\.trim\(\) \|\| ""/);
  assert.match(searchPageSource, /getPublicProducts\(1, 40, query\)/);
  assert.match(searchPageSource, /\}, \[query\]\)/);
  assert.match(searchPageSource, /setProducts\(\[\]\)/);
  assert.doesNotMatch(searchPageSource, /window\.location\.search/);
});

test("storefront product navigation keeps the database slug canonical and maps only 404s to not-found", () => {
  assert.match(publicApiSource, /\/products\/public\/products\/slug\/\$\{encodeURIComponent\(slug\)\}/);
  assert.doesNotMatch(publicApiSource, /getPublicProducts\(1, 100\)/);
  assert.match(productDetailPageSource, /error instanceof PublicApiError && error\.status === 404/);
  assert.match(productDetailPageSource, /notFound\(\)/);
  assert.match(productDetailPageSource, /throw error;/);
  assert.match(productNotFoundSource, /This jewellery item may no longer be available\./);
  assert.match(relatedProductsSource, /productHref\(item\)/);
});

test("product detail actions use plain customer-facing labels without changing their flows", () => {
  assert.match(productSource, />Quantity</);
  assert.match(productSource, /Add to Cart/);
  assert.match(productSource, /Buy Now/);
  assert.match(productSource, /\n\s+Share\n/);
  assert.doesNotMatch(productSource, /Add To Collection|Instant Checkout|Share Masterpiece/);
  assert.match(productSource, /addToCart\(product, quantity\)/);
  assert.match(productSource, /router\.push\("\/checkout"\)/);
  assert.match(productDetailSource, /Ask About This Product/);
  assert.match(productDetailSource, /Continue Shopping/);
  assert.doesNotMatch(productDetailSource, />Enquire</);
});

test("THIN MANGO HARAM keeps the API slug through search, listing, and related-product navigation", () => {
  const thinMangoHaram = {
    id: "d7ac1ec4-ed04-4a2a-91bd-915be9ddb7b2",
    name: "THIN MANGO HARAM",
    slug: "thin-mango-haram",
    is_published: true,
  };

  assert.equal(productUrl.productHref(thinMangoHaram), "/products/thin-mango-haram");
  assert.equal(
    productUrl.productHref({ ...thinMangoHaram, slug: "thin-mango-haram-canonical" }),
    "/products/thin-mango-haram-canonical"
  );
  assert.match(productCardSource, /href=\{productHref\(product\)\}/);
  assert.match(productListingSource, /href=\{productHref\(product\)\}/);
  assert.match(relatedProductsSource, /href=\{productHref\(item\)\}/);
  assert.match(showroomSource, /href=\{productHref\(product\)\}/);
  assert.doesNotMatch(productCardSource, /slugify\(|toLowerCase\(\).*replace/);
});

test("checkout resume token is tab-scoped, separate, and removable", () => {
  checkoutStorage.clearCheckoutResumeToken();
  checkoutStorage.setCheckoutResumeToken("opaque-resume-token");
  assert.equal(checkoutStorage.getCheckoutResumeToken(), "opaque-resume-token");
  assert.equal(storage.has("customer_access_token"), false);
  checkoutStorage.clearCheckoutResumeToken();
  assert.equal(checkoutStorage.getCheckoutResumeToken(), "");
});

test("customer logout clears only customer and customer-scoped checkout state", () => {
  customerStorage.setCustomerSession({ accessToken: "customer-access", refreshToken: "customer-refresh", tenantId: "t1", user: { id: "auth-1" } });
  checkoutStorage.setCheckoutResumeToken("opaque-resume-token");
  window.sessionStorage.setItem("sagunthala_pending_payment", "pending-order");
  window.localStorage.setItem("admin_token", "admin-access");
  window.localStorage.setItem("admin_refresh_token", "admin-refresh");

  customerStorage.clearCustomerLogoutState();

  assert.equal(customerStorage.getCustomerToken(), "");
  assert.equal(customerStorage.getCustomerRefreshToken(), "");
  assert.equal(customerStorage.getStoredCustomer(), null);
  assert.equal(checkoutStorage.getCheckoutResumeToken(), "");
  assert.equal(window.sessionStorage.getItem("sagunthala_pending_payment"), null);
  assert.equal(window.localStorage.getItem("admin_token"), "admin-access");
  assert.equal(window.localStorage.getItem("admin_refresh_token"), "admin-refresh");
});

test("customer logout invalidates profile refreshes and refreshes the App Router", () => {
  assert.match(customerAuthHookSource, /getCustomerSessionVersion\(\) !== sessionVersion/);
  assert.match(customerAuthHookSource, /clearCustomerLogoutState\(\)/);
  assert.match(headerSource, /router\.replace\("\/"\)/);
  assert.match(headerSource, /router\.refresh\(\)/);
});

test("checkout lifecycle resumes only the active finalized cart and clears it before a new purchase", () => {
  const originalItems = [{ productId: "product-1", quantity: 1 }];
  const buyAgainItems = [{ productId: "product-2", quantity: 1 }];
  const finalized = { state: "IDENTITY_VERIFIED", cart: originalItems };

  checkoutStorage.clearCheckoutResumeToken();
  assert.equal(checkoutStorage.canResumeFinalizedCheckout(finalized, originalItems), false, "legacy finalized tokens do not become a new checkout implicitly");
  checkoutStorage.setCheckoutResumeToken("opaque-resume-token");
  cartStore.saveCart(originalItems);
  const activeRevision = cartStore.getCartRevision();
  checkoutStorage.setCheckoutSessionContext({ items: originalItems, state: "IDENTITY_VERIFIED", cartRevision: activeRevision });
  assert.equal(checkoutStorage.canResumeFinalizedCheckout(finalized, originalItems, activeRevision), true, "an active finalized checkout survives refresh");
  assert.equal(checkoutStorage.canResumeFinalizedCheckout(finalized, buyAgainItems), false, "Buy Again with a changed bag starts fresh");

  cartStore.clearCart();
  cartStore.saveCart(originalItems);
  assert.equal(checkoutStorage.canResumeFinalizedCheckout(finalized, originalItems, cartStore.getCartRevision()), false, "a new Buy Again bag never reuses a prior finalized checkout");

  checkoutStorage.clearCheckoutResumeToken();
  assert.equal(checkoutStorage.getCheckoutResumeToken(), "");
  assert.equal(checkoutStorage.getCheckoutSessionContext(), null, "successful checkout cleanup removes its active context");
});

test("checkout does not mutate a finalized session and keeps authenticated identity finalization explicit", () => {
  assert.match(checkoutSource, /sessionStateRef\.current === "IDENTITY_VERIFIED"/);
  assert.match(checkoutSource, /sessionMutation\.current/);
  assert.match(checkoutSource, /api\.checkout\.sessions\.identity\.current/);
  assert.match(checkoutSource, /canResumeFinalizedCheckout\(session, items, getCartRevision\(\)\)/);
  assert.match(checkoutSource, /if\s*\(await resumeFinalizedSession\(\)\)\s*return;\s*const response = await api\.checkout\.sessions\.updateDraft/);
  assert.match(checkoutSource, /setCheckoutSessionContext\(\{\s*items: cart,\s*state: finalizedState,\s*cartRevision: getCartRevision\(\)\s*\}\)/);
});

test("checkout lifecycle keeps draft mutation before identity and directs finalized refreshes to review", () => {
  assert.match(checkoutSource, /api\.checkout\.sessions\.updateDraft\(token\.current/);
  assert.match(checkoutSource, /session\.state === "IDENTITY_VERIFIED" \? 2 : 0/);
  assert.match(checkoutSource, /startOrResume\(cart,\s*\{\s*forceFresh: true\s*\}\)/);
  assert.match(checkoutSource, /api\.checkout\.sessions\.identity\.current/);
  assert.match(checkoutSource, /if \(await reconcilePendingPayment\(\)\) return;/);
  assert.match(checkoutSource, /paymentStatus !== "PAID"/);
});

test("delivery draft reuses the single contact name and phone as address recipient fields", () => {
  const payload = checkoutStorage.buildCheckoutAddressDraft({
    fullName: "Ananya Natarajan",
    phone: "9876543210",
    address: {
      fullName: "", phone: "", addressLine1: "12 Temple Road", addressLine2: "",
      landmark: "", city: "Chennai", state: "Tamil Nadu", pincode: "600001", country: "IN",
    },
  });

  assert.deepEqual(payload, {
    fullName: "Ananya Natarajan", phone: "9876543210", addressLine1: "12 Temple Road", addressLine2: "",
    landmark: "", city: "Chennai", state: "Tamil Nadu", pincode: "600001", country: "IN",
  });
  assert.equal(Object.hasOwn(payload, "stateCode"), false);
  assert.equal(Object.hasOwn(payload, "countryCode"), false);
});

test("checkout validation details map to their form fields", () => {
  assert.deepEqual(checkoutStorage.mapCheckoutValidationErrors({ payload: { error: { details: [
    { field: "body.address.fullName", message: "Recipient name is required" },
    { field: "body.address.phone", message: "Recipient phone is required" },
  ] } } }), {
    fullName: "Recipient name is required",
    phone: "Recipient phone is required",
  });
});

test("frontend API uses only the opaque resume header for checkout-session routes", () => {
  assert.match(apiSource, /\/checkout\/sessions\/resume/);
  assert.match(apiSource, /"x-checkout-resume-token": resumeToken/);
  assert.match(apiSource, /\/checkout\/sessions\/identity\/password/);
  assert.match(apiSource, /\/checkout\/sessions\/identity\/current/);
  assert.match(apiSource, /\/checkout\/sessions\/identity\/email\/send/);
  assert.match(apiSource, /\/checkout\/sessions\/identity\/email\/verify/);
  assert.doesNotMatch(apiSource, /checkoutSessionId/);
});

test("anonymous checkout is not redirected through login and preserves the trusted prepare boundary", () => {
  assert.doesNotMatch(checkoutSource, /router\.replace\([^\n]*\/login/);
  assert.match(checkoutSource, /api\.checkout\.sessions\.start/);
  assert.match(checkoutSource, /api\.checkout\.prepare\(\{\s*items: cart,\s*addressId,\s*idempotencyKey/);
  assert.match(checkoutSource, /clearCheckoutResumeToken\(\)/);
  assert.match(checkoutSource, /address: buildCheckoutAddressDraft\(nextDraft\)/);
  assert.match(checkoutSource, /mapCheckoutValidationErrors/);
  assert.doesNotMatch(checkoutSource, /Use password/);
  assert.doesNotMatch(checkoutSource, /Set a password/);
  assert.match(checkoutSource, /Verify your email/);
});

test("OTP resend labels use the server-issued timestamp and show a live countdown", () => {
  assert.match(checkoutSource, /resendSeconds > 0 \? `Resend code in \$\{resendSeconds\}s` : "Resend code"/);
  assert.match(checkoutSource, /Date\.parse\(resendAt \|\| ""\)/);
  assert.match(forgotSource, /response\?\.data\?\.resendAvailableAt/);
  assert.doesNotMatch(forgotSource, /RESEND_COOLDOWN_SECONDS/);
});

test("forgot-password recovery persists only the reset step, normalized email, and server cooldown", () => {
  assert.match(forgotSource, /FORGOT_PASSWORD_RESUME_KEY/);
  assert.match(forgotSource, /window\.sessionStorage\.setItem\(FORGOT_PASSWORD_RESUME_KEY/);
  assert.match(forgotSource, /email: normalizedEmail/);
  assert.match(forgotSource, /step: FORGOT_PASSWORD_STEPS\.RESET/);
  assert.match(forgotSource, /resendAvailableAt/);
  assert.match(forgotSource, /clearForgotPasswordResume\(\)/);
  assert.match(forgotSource, /setStep\(FORGOT_PASSWORD_STEPS\.RESET\)/);
});

test("checkout and forgot-password resend requests have an in-flight guard", () => {
  assert.match(checkoutSource, /const resendInFlight = useRef\(false\)/);
  assert.match(checkoutSource, /if \(resendInFlight\.current\) return/);
  assert.match(checkoutSource, /resendInFlight\.current = true/);
  assert.match(checkoutSource, /disabled=\{busy \|\| resendingCode \|\| resendSeconds > 0\}/);
  assert.match(forgotSource, /const sendInFlight = useRef\(false\)/);
  assert.match(forgotSource, /if \(sendInFlight\.current \|\| busy \|\| \(resend && secondsUntilResend > 0\)\) return/);
  assert.match(forgotSource, /sendInFlight\.current = true/);
});

test("delivery normalization uses one canonical recipient phone and India-first validation", () => {
  const result = addressContact.validateAddressContact({
    fullName: "Ananya Natarajan", email: "ananya@example.com", phone: "98765 43210", address: {
      addressLine1: "12 Temple Road", city: "Chennai", state: "TN", pincode: "600001", country: "IN",
    }, callingCode: "+91",
  });
  assert.deepEqual(result.errors, {});
  assert.equal(result.normalizedPhone, "+919876543210");
  assert.equal(addressContact.normalizedStateLabel("tamilnadu"), "Tamil Nadu");
  assert.match(addressContact.validateAddressContact({ fullName: "A", email: "bad", phone: "123", address: { country: "IN", pincode: "123456" } }).errors.phone, /Indian mobile/);
});

test("Buy Now enters checkout through the existing cart", () => {
  assert.match(productSource, /addToCart\(product, quantity\)/);
  assert.match(productSource, /router\.push\("\/checkout"\)/);
});

test("customer email sign-in/sign-up remains OTP-first with password, Google, and safe redirect contracts", () => {
  assert.match(loginSource, /useState\("otp"\)/);
  assert.match(loginSource, /Continue with email/);
  assert.match(loginSource, /secure verification code/);
  assert.match(loginSource, /Use password instead/);
  assert.match(loginSource, /GoogleSignInButton/);
  assert.match(loginSource, /signInWithGoogle/);
  assert.match(loginSource, /safeReturnTo/);
  assert.match(loginSource, /!value\.startsWith\("\/\/"\)/);
  assert.match(loginSource, /establishSession/);
  assert.match(loginSource, /router\.refresh\(\)/);
  assert.match(loginSource, /if \(!isLoading && customer\) router\.replace\(target\)/);
  assert.doesNotMatch(loginSource, /Continue with email code/);
  assert.doesNotMatch(loginSource, /admin_token|admin_refresh_token/);
});

test("forgot-password reset state always contains the OTP and password fields", () => {
  assert.match(loginSource, /forgot-password/);
  assert.match(forgotSource, /passwordForgot/);
  assert.match(forgotSource, /passwordReset/);
  assert.match(forgotSource, /FORGOT_PASSWORD_STEPS\.RESET/);
  assert.match(forgotSource, /one-time-code/);
  assert.match(forgotSource, /inputMode="numeric"/);
  assert.match(forgotSource, /pattern="\[0-9\]\*"/);
  assert.match(forgotSource, /newPassword/);
  assert.match(forgotSource, /confirmPassword/);
  assert.match(forgotSource, /Resend code/);
  assert.match(forgotSource, /Change email/);
  assert.match(forgotSource, /safeReturnTo/);
  assert.match(forgotSource, /transitionForgotPasswordStep/);
  assert.match(forgotSource, /Password updated/);
  assert.doesNotMatch(forgotSource, /setStep\(3\)/);
});

test("forgot-password blocks a missing OTP, includes it in the reset payload, and maps OTP failures", () => {
  assert.equal(forgotPassword.transitionForgotPasswordStep(forgotPassword.FORGOT_PASSWORD_STEPS.EMAIL, "SEND_SUCCEEDED"), forgotPassword.FORGOT_PASSWORD_STEPS.RESET);
  assert.equal(forgotPassword.transitionForgotPasswordStep(forgotPassword.FORGOT_PASSWORD_STEPS.RESET, "RESET_SUCCEEDED"), forgotPassword.FORGOT_PASSWORD_STEPS.SUCCESS);
  assert.deepEqual(
    forgotPassword.resetFieldErrors({ code: "", newPassword: "ValidPassword9", confirmPassword: "ValidPassword9" }),
    { code: "Enter the six-digit verification code." },
  );
  assert.deepEqual(
    forgotPassword.resetPayload({ email: " customer@example.com ", code: "482901", newPassword: "ValidPassword9", confirmPassword: "ValidPassword9" }),
    { email: "customer@example.com", code: "482901", newPassword: "ValidPassword9", confirmPassword: "ValidPassword9" },
  );
  assert.equal(forgotPassword.resetErrorField({ status: 401, message: "Invalid or expired verification code" }), "code");
  assert.equal(forgotPassword.resetErrorField({ message: "Passwords do not match" }), "confirmPassword");
  assert.equal(forgotPassword.resetFieldErrors({ code: "482901", newPassword: "ValidPassword9", confirmPassword: "ValidPassword9" }).code, undefined);
});

test("admin expected delivery uses an ISO-native date picker and rejects dates before today or dispatch", () => {
  assert.match(adminOrderDetailSource, /type="date"/);
  assert.match(adminOrderDetailSource, /min=\{expectedDeliveryMin\}/);
  assert.match(adminOrderDetailSource, /if \(form\.expectedDeliveryDate\) payload\.expectedDeliveryDate = form\.expectedDeliveryDate/);
  assert.equal(expectedDelivery.validateExpectedDeliveryDate({ expectedDeliveryDate: "26-09-2026", today: "2026-09-26" }), "Enter the expected delivery date as YYYY-MM-DD.");
  assert.equal(expectedDelivery.validateExpectedDeliveryDate({ expectedDeliveryDate: "2026-09-25", today: "2026-09-26" }), "Expected delivery cannot be before today.");
  assert.equal(expectedDelivery.validateExpectedDeliveryDate({ expectedDeliveryDate: "2026-09-26", today: "2026-09-26", dispatchedAt: "2026-09-27T10:00:00.000Z" }), "Expected delivery cannot be before the dispatch date.");
  assert.equal(expectedDelivery.validateExpectedDeliveryDate({ expectedDeliveryDate: "2026-09-30", today: "2026-09-26", dispatchedAt: "2026-09-27T10:00:00.000Z" }), "");
  assert.equal(expectedDelivery.expectedDeliveryMinimum({ today: "2026-09-26", dispatchedAt: "2026-09-27T10:00:00.000Z" }), "2026-09-27");
});

test("admin reports use one native date range, applied filters, page reset, and deterministic timestamps", () => {
  assert.match(dateRangeSource, /type="date"/);
  assert.match(dateRangeSource, /min=\{from \|\| undefined\}/);
  assert.match(adminDateSource, /timeZone: "Asia\/Kolkata"/);
  assert.match(adminDateSource, /"en-GB"/);
  for (const source of [adminOrdersSource, adminCustomersSource, adminPaymentsSource]) {
    assert.match(source, /DateRangeFilter/);
    assert.match(source, /Download Report/);
    assert.match(source, /setPage\(1\)|page: 1/);
    assert.match(source, /To date cannot be before from date\./);
    assert.match(source, /formatAdminDateTime/);
  }
});

test("admin report API calls preserve active filters and never put pagination on exports", () => {
  assert.match(apiSource, /\/admin\/orders\/report\$\{createQueryString\(params\)\}/);
  assert.match(apiSource, /\/admin\/customers\/report\$\{createQueryString\(params\)\}/);
  assert.match(apiSource, /\/admin\/payments\/report\$\{createQueryString\(params\)\}/);
  assert.match(adminOrdersSource, /api\.orders\.admin\.report\(applied\)/);
  assert.match(adminCustomersSource, /api\.customers\.admin\.report\(applied\)/);
  assert.match(adminPaymentsSource, /api\.adminPayments\.report\(applied\)/);
  assert.match(adminOrdersSource, /Created At/);
  assert.match(adminCustomersSource, /Created At/);
  assert.match(adminPaymentsSource, /Created At/);
  assert.match(adminPaymentsSource, /Paid At/);
});

test("admin inventory uses a ledger-driven delta and reason workflow", () => {
  assert.match(apiSource, /\/admin\/inventory/);
  assert.match(adminInventorySource, /Current stock/);
  assert.match(adminInventorySource, /quantityDelta/);
  assert.match(adminInventorySource, /reason/);
  assert.match(adminInventorySource, /Stock history/);
  assert.match(adminInventorySource, /History \/ adjust/);
  assert.doesNotMatch(adminInventorySource, /new absolute stock/i);
});

test("Admin dashboard uses the aggregated overview, date controls, drilldowns, and honest analytics state", () => {
  assert.match(apiSource, /\/admin\/dashboard\/overview/);
  assert.match(adminDashboardSource, /api\.adminDashboard\.overview\(range\)/);
  assert.match(adminDashboardSource, /Last 30 days/);
  assert.match(adminDashboardSource, /DateRangeFilter/);
  assert.match(adminDashboardSource, /Sales overview/);
  assert.match(adminDashboardSource, /Order pipeline/);
  assert.match(adminDashboardSource, /Payment health/);
  assert.match(adminDashboardSource, /Inventory health/);
  assert.match(adminDashboardSource, /Needs attention/);
  assert.match(adminDashboardSource, /trafficAnalytics\.reason/);
  assert.match(adminDashboardSource, /\/admin\/payments/);
  assert.match(adminDashboardSource, /\/admin\/orders/);
  assert.match(adminDashboardSource, /\/admin\/inventory/);
  assert.doesNotMatch(headerSource, /enquiryCount|enquiries\/count/);
});

test("notification pages use owned APIs, real unread counts, actions, and read controls", () => {
  assert.match(apiSource, /\/notifications\$\{createQueryString\(params\)\}/);
  assert.match(apiSource, /\/admin\/notifications\$\{createQueryString\(params\)\}/);
  assert.match(customerNotificationsSource, /api\.notifications\.mine/);
  assert.match(adminNotificationsSource, /api\.notifications\.admin\.list/);
  assert.match(notificationListSource, /unreadCount/);
  assert.match(notificationListSource, /Mark all read/);
  assert.match(notificationListSource, /Mark read/);
  assert.match(notificationListSource, /actionUrl/);
});

test("customer and Admin notification bells share authoritative audience-scoped count state", () => {
  assert.match(headerSource, /useNotificationCount\("customer", Boolean\(customer && !isAdminAuthenticated\)\)/);
  assert.match(headerSource, /useNotificationCount\("admin", Boolean\(isAdminAuthenticated\)\)/);
  assert.match(headerSource, /\/account\/notifications/);
  assert.match(headerSource, /\/admin\/notifications/);
  assert.match(headerSource, /customerNotificationCount > 0/);
  assert.match(headerSource, /adminNotificationCount > 0/);
  assert.match(headerSource, /clearNotificationCount\("customer"\)/);
  assert.match(headerSource, /clearNotificationCount\("admin"\)/);
  assert.match(notificationCountSource, /response\?\.data\?\.unreadCount/);
  assert.match(notificationListSource, /publishNotificationCount\(audience/);
});

test("payment celebration is gated by trusted PAID state, and purchase review waits for delivery", () => {
  assert.match(orderDetailSource, /search\.get\("payment"\) === "confirmed" && order\.paymentStatus === "PAID"/);
  assert.match(orderDetailSource, /PaymentSuccessCelebration/);
  assert.match(celebrationSource, /prefers-reduced-motion: reduce/);
  assert.match(celebrationSource, /sessionStorage\.getItem/);
  assert.match(celebrationSource, /sessionStorage\.setItem/);
  assert.match(deliveredReviewSource, /status !== "DELIVERED"/);
  assert.match(deliveredReviewSource, /We hope you love your jewellery/);
  assert.match(deliveredReviewSource, /api\.orders\.reviewItems\(orderReference\)/);
  assert.match(deliveredReviewSource, /api\.orders\.submitItemReview/);
  assert.match(deliveredReviewSource, /Write a Review/);
  assert.match(deliveredReviewSource, /Review submitted/);
  assert.doesNotMatch(orderDetailSource, /Product review/);
});

test("premium catalogue cards and detail discovery use real product, review, and category data", () => {
  assert.match(productListingSource, /aspect-\[4\/5\]/);
  assert.match(productListingSource, /Add \$\{product\.name\} to cart/);
  assert.match(productListingSource, /View piece/);
  assert.match(productListingSource, /product\.average_rating/);
  assert.match(productListingSource, /new URLSearchParams\(window\.location\.search\)/);
  assert.match(productDetailSource, /ProductActions/);
  assert.match(productDetailSource, /product\.collection_name/);
  assert.match(productDetailSource, /href="#reviews"/);
  assert.match(productDetailSource, /RelatedProductSection/);
  assert.match(relatedProductsSource, /api\.products\.public\.list/);
  assert.match(relatedProductsSource, /category: product\.category_id/);
  assert.match(productReviewsSource, /id="reviews"/);
});

test("homepage uses one real catalogue request and a showroom composition without legacy animation code", () => {
  assert.match(homeSource, /ShowroomExperience/);
  assert.doesNotMatch(homeSource, /TopSelling|NewArrivals/);
  assert.match(showroomSource, /api\.products\.public\.list\(\{ page: 1, limit: 12, sort: "newest" \}\)/);
  assert.match(showroomSource, /CategoryRail|SignatureMoment|CollectionStory|CuratedComposition|CompleteTheLook|CraftAndTrust/);
  assert.match(showroomSource, /product\.is_featured \|\| product\.is_best_sell/);
  assert.match(showroomSource, /product\.collection_id/);
  assert.match(showroomSource, /snap-x snap-mandatory/);
  assert.match(showroomSource, /from "next\/image"/);
  assert.match(showroomSource, /addToCart\(product\)/);
  assert.match(showroomSource, /router\.push\("\/checkout"\)/);
  assert.match(showroomSource, /ProductCard/);
  assert.match(showroomSource, /ShowroomMotion/);
  assert.match(showroomSource, /data-motion="stagger"|data-motion="split"|data-motion="commerce"/);
  assert.match(showroomMotionSource, /revealFor/);
  assert.match(showroomMotionSource, /clipPath/);
  assert.match(showroomMotionSource, /gsap\.matchMedia/);
  assert.match(showroomMotionSource, /prefers-reduced-motion: reduce/);
  assert.match(showroomMotionSource, /context\.revert/);
  assert.doesNotMatch(showroomMotionSource, /setInterval|mousemove/);
});

test("premium homepage hero uses an optimized critical image with restrained motion", () => {
  assert.match(dynamicHeroSource, /PremiumHero/);
  assert.match(premiumHeroSource, /from "next\/image"/);
  assert.match(premiumHeroSource, /priority=\{current === 0\}/);
  assert.match(premiumHeroSource, /sizes="100vw"/);
  assert.match(premiumHeroSource, /prefers-reduced-motion: reduce/);
  assert.match(premiumHeroSource, /gsap\.timeline/);
  assert.match(premiumHeroSource, /clipPath/);
  assert.match(premiumHeroSource, /data-hero-heading-line/);
  assert.match(premiumHeroSource, /data-magnetic/);
  assert.match(premiumHeroSource, /ScrollTrigger/);
  assert.match(premiumHeroSource, /prefers-reduced-motion: reduce/);
  assert.match(finalCtaMotionSource, /ScrollTrigger/);
  assert.match(finalCtaMotionSource, /from "next\/image"/);
  assert.doesNotMatch(premiumHeroSource, /setInterval|mousemove/);
});

test("homepage sound gate is explicit, session-scoped, and does not use the legacy autoplay pattern", () => {
  assert.match(homeSource, /HomeExperienceGate/);
  assert.match(homeExperienceGateSource, /Enter with sound/);
  assert.match(homeExperienceGateSource, /Continue without sound/);
  assert.match(homeExperienceGateSource, /sessionStorage/);
  assert.match(homeExperienceGateSource, /audio\.preload = "metadata"/);
  assert.match(homeExperienceGateSource, /soundEnabled/);
  assert.doesNotMatch(homeExperienceGateSource, /localStorage|timeupdate|setTimeout|preload = "auto"/);
});
